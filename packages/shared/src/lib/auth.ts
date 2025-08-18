import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface LicenseValidationResult {
  valid: boolean;
  message?: string;
  features?: string[];
}

// Stubbed SaaS API for license validation
const SAAS_API_BASE = process.env['SAAS_API_BASE'] || 'https://api.automate-saas.com';

export async function validateLicenseKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const licenseKey = req.headers['x-license-key'] as string;
  
  if (!licenseKey) {
    res.status(401).json({ error: 'License key required' });
    return;
  }

  try {
    // In production, this would call your SaaS API
    const isValid = await validateLicenseWithSaaS(licenseKey);
    
    if (!isValid.valid) {
      res.status(403).json({ error: isValid.message || 'Invalid license key' });
      return;
    }

    // Add license info to request for downstream use
    (req as any).licenseInfo = isValid;
    next();
  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ error: 'License validation failed' });
  }
}

async function validateLicenseWithSaaS(licenseKey: string): Promise<LicenseValidationResult> {
  try {
    // In development, we'll stub this
    if (process.env['NODE_ENV'] === 'development') {
      return {
        valid: true,
        features: ['pr-review', 'github', 'bitbucket']
      };
    }

    const response = await axios.post(`${SAAS_API_BASE}/api/license/validate`, {
      licenseKey
    }, {
      timeout: 5000
    });

    return response.data;
  } catch (error) {
    console.error('SaaS API error:', error);
    return {
      valid: false,
      message: 'Failed to validate license with SaaS'
    };
  }
}

export function requireFeature(feature: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const licenseInfo = (req as any).licenseInfo as LicenseValidationResult;
    
    if (!licenseInfo?.features?.includes(feature)) {
      res.status(403).json({ error: `Feature '${feature}' not available in your license` });
      return;
    }
    
    next();
  };
}
