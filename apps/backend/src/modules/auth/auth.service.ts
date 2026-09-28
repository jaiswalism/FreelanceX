import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';
import { prisma } from '../../database/prisma.js';
import { config } from '../../config/index.js';
import { HexAddress } from '@freelancerx/shared';

export interface JwtPayload {
  userId: string;
  address: string;
  sessionId: string;
}

export class AuthService {
  /**
   * Generates a secure, single-use nonce for wallet authentication
   */
  static async generateNonce(rawAddress: string): Promise<{ nonce: string; expiresAt: Date }> {
    const address = rawAddress.toLowerCase();
    const nonce = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Invalidate any existing unused nonces for this address
    await prisma.authNonce.updateMany({
      where: { address, used: false },
      data: { used: true },
    });

    await prisma.authNonce.create({
      data: {
        address,
        nonce,
        expiresAt,
        used: false,
      },
    });

    return { nonce, expiresAt };
  }

  /**
   * Verifies the cryptographic signature and issues a session JWT
   */
  static async verifySignature(
    rawAddress: string,
    signature: string,
    nonceString: string
  ): Promise<{ token: string; user: any; expiresAt: Date }> {
    const address = rawAddress.toLowerCase() as HexAddress;

    // 1. Validate Nonce from Database
    const nonceRecord = await prisma.authNonce.findUnique({
      where: { nonce: nonceString },
    });

    if (!nonceRecord) {
      throw new Error('Invalid authentication nonce');
    }

    if (nonceRecord.address.toLowerCase() !== address) {
      throw new Error('Nonce was not issued for this address');
    }

    if (nonceRecord.used) {
      throw new Error('Nonce has already been used');
    }

    if (new Date() > nonceRecord.expiresAt) {
      throw new Error('Authentication nonce has expired');
    }

    // Mark nonce as used immediately (single-use invariant)
    await prisma.authNonce.update({
      where: { id: nonceRecord.id },
      data: { used: true },
    });

    // 2. Cryptographically verify signature using viem
    const expectedMessage = `FreelancerX Auth Nonce: ${nonceString}\nAddress: ${rawAddress}\nChainId: ${config.chainId}`;
    
    let isValid = false;
    try {
      isValid = await verifyMessage({
        address,
        message: expectedMessage,
        signature: signature as `0x${string}`,
      });
    } catch {
      // Fallback for custom or direct signed nonce message
      try {
        isValid = await verifyMessage({
          address,
          message: nonceString,
          signature: signature as `0x${string}`,
        });
      } catch {
        isValid = false;
      }
    }

    if (!isValid) {
      throw new Error('Cryptographic signature verification failed');
    }

    // 3. Find or Create User with dual-sided profiles (Client & Freelancer)
    let user = await prisma.user.findUnique({
      where: { address },
      include: {
        freelancerProfile: true,
        clientProfile: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          address,
          freelancerProfile: {
            create: {
              displayName: `Freelancer_${address.slice(2, 8)}`,
              skills: [],
            },
          },
          clientProfile: {
            create: {
              displayName: `Client_${address.slice(2, 8)}`,
            },
          },
        },
        include: {
          freelancerProfile: true,
          clientProfile: true,
        },
      });
    }

    // 4. Create Session in DB
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const sessionToken = randomBytes(48).toString('hex');

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: sessionExpiresAt,
        revoked: false,
      },
    });

    // 5. Issue JWT
    const token = jwt.sign(
      {
        userId: user.id,
        address: user.address,
        sessionId: session.id,
      } as JwtPayload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );

    return {
      token,
      user,
      expiresAt: sessionExpiresAt,
    };
  }

  /**
   * Revokes a session (Logout)
   */
  static async logout(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    });
  }
}
