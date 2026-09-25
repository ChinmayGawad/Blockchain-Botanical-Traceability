import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import apiClient from '../../src/services/api';

describe('AuthContext Login Logic & Password Validation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('rejects login when incorrect password is entered in offline/fallback mode', async () => {
    // Mock apiClient to simulate offline backend (network error without response)
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let success = false;
    await act(async () => {
      success = await result.current.login('rajesh@vedicfarms.org', 'FARMER', 'wrongpassword');
    });

    expect(success).toBe(false);
    expect(result.current.currentUser.email).not.toBe('rajesh@vedicfarms.org');
  });

  it('rejects login when password is empty or whitespace', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    let success = false;
    await act(async () => {
      success = await result.current.login('rajesh@vedicfarms.org', 'FARMER', '   ');
    });

    expect(success).toBe(false);
  });

  it('accepts login when correct password is entered in offline/fallback mode', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let success = false;
    await act(async () => {
      success = await result.current.login('rajesh@vedicfarms.org', 'FARMER', 'password123');
    });

    expect(success).toBe(true);
    expect(result.current.currentUser.email).toBe('rajesh@vedicfarms.org');
    expect(result.current.currentUser.role).toBe('FARMER');
  });

  it('does NOT fall back to local login when backend actively rejects credentials with 401', async () => {
    // Backend is reachable and returns 401 Unauthorized
    const axios401Error = {
      response: {
        status: 401,
        data: { message: 'Invalid email or password' },
      },
    };
    vi.spyOn(apiClient, 'post').mockRejectedValue(axios401Error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let success = false;
    await act(async () => {
      // Even if 'password123' would match offline, backend 401 MUST NOT be bypassed
      success = await result.current.login('rajesh@vedicfarms.org', 'FARMER', 'wrongpassword');
    });

    expect(success).toBe(false);
    expect(result.current.currentUser.email).not.toBe('rajesh@vedicfarms.org');
  });

  it('successfully logs in when backend returns 200 with JWT token and user', async () => {
    const mockBackendUser = {
      id: 'USR-FRM-01',
      name: 'Rajesh Patel',
      email: 'rajesh@vedicfarms.org',
      role: 'FARMER' as const,
      organization: 'Vedic Agro Organic Cooperative',
      location: 'Neemuch, Madhya Pradesh, India',
      status: 'ACTIVE' as const,
      joinedDate: '2023-03-10',
    };

    vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        token: 'mock-jwt-token-xyz',
        user: mockBackendUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let success = false;
    await act(async () => {
      success = await result.current.login('rajesh@vedicfarms.org', 'FARMER', 'password123');
    });

    expect(success).toBe(true);
    expect(result.current.currentUser.email).toBe('rajesh@vedicfarms.org');
    expect(localStorage.getItem('florachain_jwt_token')).toBe('mock-jwt-token-xyz');
  });

  it('validates custom registered passwords correctly', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Register a consumer with a custom password (consumers are ACTIVE immediately)
    await act(async () => {
      await result.current.registerUser(
        {
          name: 'Priya Sharma',
          email: 'priya@consumer.net',
          role: 'CONSUMER',
          organization: 'Public Consumer Portal',
          location: 'Mumbai, India',
        },
        'myCustomSecret99'
      );
    });

    // Try logging in with wrong password
    let failedSuccess = true;
    await act(async () => {
      failedSuccess = await result.current.login('priya@consumer.net', 'CONSUMER', 'wrongSecret');
    });
    expect(failedSuccess).toBe(false);

    // Try logging in with default 'password123' (which shouldn't work because custom password was set)
    let defaultPassSuccess = true;
    await act(async () => {
      defaultPassSuccess = await result.current.login('priya@consumer.net', 'CONSUMER', 'password123');
    });
    expect(defaultPassSuccess).toBe(false);

    // Log in with correct custom password
    let success = false;
    await act(async () => {
      success = await result.current.login('priya@consumer.net', 'CONSUMER', 'myCustomSecret99');
    });
    expect(success).toBe(true);
    expect(result.current.currentUser.email).toBe('priya@consumer.net');
  });

  it('prevents unapproved users from logging in until approved', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Register a farmer (non-consumer accounts start as PENDING_APPROVAL)
    await act(async () => {
      await result.current.registerUser(
        {
          name: 'New Farmer',
          email: 'newfarmer@green.org',
          role: 'FARMER',
          organization: 'Green Farms',
          location: 'Punjab',
        },
        'farmerPass123'
      );
    });

    // Try logging in before approval
    let loginBeforeApproval = true;
    await act(async () => {
      loginBeforeApproval = await result.current.login('newfarmer@green.org', 'FARMER', 'farmerPass123');
    });
    expect(loginBeforeApproval).toBe(false);

    // Find user ID and approve
    const pendingUser = result.current.users.find(u => u.email === 'newfarmer@green.org');
    expect(pendingUser).toBeDefined();

    await act(async () => {
      await result.current.approveUser(pendingUser!.id);
    });

    // Now try logging in with correct password
    let loginAfterApproval = false;
    await act(async () => {
      loginAfterApproval = await result.current.login('newfarmer@green.org', 'FARMER', 'farmerPass123');
    });
    expect(loginAfterApproval).toBe(true);
    expect(result.current.currentUser.email).toBe('newfarmer@green.org');
  });
});
