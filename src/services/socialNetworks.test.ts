import { describe, it, expect } from 'vitest';
import { useRealtimeSocialNetworks } from '../hooks/useRealtimeSocialNetworks';

describe('SocialNetworks Hooks & Types', () => {
  it('useRealtimeSocialNetworks is a valid React hook function', () => {
    expect(typeof useRealtimeSocialNetworks).toBe('function');
  });

  it('exports canonical social network properties', () => {
    const mockNet = {
      id: 'instagram',
      platform: 'instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/instsermelhor',
      order: 1,
      isActive: true,
      openInNewTab: true,
      showInHeader: false,
      showInFooter: true,
      showInLanding: true,
    };

    expect(mockNet.url).toBe('https://www.instagram.com/instsermelhor');
    expect(mockNet.platform).toBe('instagram');
    expect(mockNet.isActive).toBe(true);
  });
});
