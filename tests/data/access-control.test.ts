import { describe, it, expect } from 'vitest';
import { meetsAccessTier, memberLevelToAccessTier, accessTierLabel } from '@/lib/types';
import { canAccessLesson, isAdmin, isInstructor, isStaff, getCourseAccessTier, canAccessCourse, getAccessDeniedReason, getLessonCTALabel } from '@/lib/access-control';
import type { ProfilePublic, CourseAccess, AccessTier, Course } from '@/lib/types';

// =============================================
// Test helpers
// =============================================
function makeProfile(overrides: Partial<ProfilePublic> = {}): ProfilePublic {
  return {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test User',
    phone: '0123456789',
    role: 'user',
    systemRole: 'student',
    memberLevel: 'Free',
    avatarUrl: null,
    ...overrides,
  };
}

function makeAccess(overrides: Partial<CourseAccess> = {}): CourseAccess {
  return {
    id: 'ca-1',
    userId: 'user-1',
    courseId: 'course-1',
    accessTier: 'premium',
    source: 'order',
    status: 'active',
    activatedAt: new Date().toISOString(),
    expiresAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeLesson(tier: AccessTier) {
  return { accessTier: tier };
}

// =============================================
// ACCESS TIER COMPARISON
// =============================================
describe('meetsAccessTier', () => {
  it('free tier meets free requirement', () => {
    expect(meetsAccessTier('free', 'free')).toBe(true);
  });

  it('premium tier meets free and premium requirements', () => {
    expect(meetsAccessTier('premium', 'free')).toBe(true);
    expect(meetsAccessTier('premium', 'premium')).toBe(true);
  });

  it('vip tier meets all requirements', () => {
    expect(meetsAccessTier('vip', 'free')).toBe(true);
    expect(meetsAccessTier('vip', 'premium')).toBe(true);
    expect(meetsAccessTier('vip', 'vip')).toBe(true);
  });

  it('free tier does NOT meet premium or vip', () => {
    expect(meetsAccessTier('free', 'premium')).toBe(false);
    expect(meetsAccessTier('free', 'vip')).toBe(false);
  });

  it('premium tier does NOT meet vip', () => {
    expect(meetsAccessTier('premium', 'vip')).toBe(false);
  });

  it('undefined tier only meets free', () => {
    expect(meetsAccessTier(undefined, 'free')).toBe(true);
    expect(meetsAccessTier(undefined, 'premium')).toBe(false);
    expect(meetsAccessTier(undefined, 'vip')).toBe(false);
  });
});

describe('memberLevelToAccessTier', () => {
  it('converts correctly', () => {
    expect(memberLevelToAccessTier('Free')).toBe('free');
    expect(memberLevelToAccessTier('Premium')).toBe('premium');
    expect(memberLevelToAccessTier('VIP')).toBe('vip');
    expect(memberLevelToAccessTier('unknown')).toBe('free');
  });
});

// =============================================
// LESSON ACCESS
// =============================================
describe('canAccessLesson', () => {
  it('anyone can access free lessons (even guest)', () => {
    expect(canAccessLesson(null, null, makeLesson('free'))).toBe(true);
  });

  it('guest cannot access premium lessons', () => {
    expect(canAccessLesson(null, null, makeLesson('premium'))).toBe(false);
  });

  it('guest cannot access vip lessons', () => {
    expect(canAccessLesson(null, null, makeLesson('vip'))).toBe(false);
  });

  it('logged-in user without course access cannot access premium', () => {
    const profile = makeProfile();
    expect(canAccessLesson(profile, null, makeLesson('premium'))).toBe(false);
  });

  it('user with premium access CAN access premium lesson', () => {
    const profile = makeProfile();
    const access = makeAccess({ accessTier: 'premium' });
    expect(canAccessLesson(profile, access, makeLesson('premium'))).toBe(true);
  });

  it('user with premium access CANNOT access vip lesson', () => {
    const profile = makeProfile();
    const access = makeAccess({ accessTier: 'premium' });
    expect(canAccessLesson(profile, access, makeLesson('vip'))).toBe(false);
  });

  it('user with vip access CAN access all lessons', () => {
    const profile = makeProfile();
    const access = makeAccess({ accessTier: 'vip' });
    expect(canAccessLesson(profile, access, makeLesson('free'))).toBe(true);
    expect(canAccessLesson(profile, access, makeLesson('premium'))).toBe(true);
    expect(canAccessLesson(profile, access, makeLesson('vip'))).toBe(true);
  });

  it('admin can access everything', () => {
    const admin = makeProfile({ role: 'admin', systemRole: 'admin' });
    expect(canAccessLesson(admin, null, makeLesson('vip'))).toBe(true);
  });

  it('instructor can access everything', () => {
    const instructor = makeProfile({ systemRole: 'instructor' });
    expect(canAccessLesson(instructor, null, makeLesson('vip'))).toBe(true);
  });

  it('expired access defaults to free', () => {
    const profile = makeProfile();
    const expiredAccess = makeAccess({
      accessTier: 'premium',
      expiresAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    });
    expect(canAccessLesson(profile, expiredAccess, makeLesson('premium'))).toBe(false);
  });

  it('cancelled access defaults to free', () => {
    const profile = makeProfile();
    const cancelledAccess = makeAccess({
      accessTier: 'premium',
      status: 'cancelled',
    });
    expect(canAccessLesson(profile, cancelledAccess, makeLesson('premium'))).toBe(false);
  });
});

// =============================================
// SYSTEM ROLE CHECKS
// =============================================
describe('system role checks', () => {
  it('isAdmin detects admin and sub_admin', () => {
    expect(isAdmin(makeProfile({ role: 'admin' }))).toBe(true);
    expect(isAdmin(makeProfile({ role: 'sub_admin' }))).toBe(true);
    expect(isAdmin(makeProfile({ systemRole: 'admin' }))).toBe(true);
    expect(isAdmin(makeProfile({ role: 'user' }))).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it('isInstructor detects instructor', () => {
    expect(isInstructor(makeProfile({ systemRole: 'instructor' }))).toBe(true);
    expect(isInstructor(makeProfile({ role: 'instructor' }))).toBe(true);
    expect(isInstructor(makeProfile({ role: 'user' }))).toBe(false);
  });

  it('isStaff detects admin and instructor', () => {
    expect(isStaff(makeProfile({ role: 'admin' }))).toBe(true);
    expect(isStaff(makeProfile({ systemRole: 'instructor' }))).toBe(true);
    expect(isStaff(makeProfile({ role: 'user' }))).toBe(false);
  });
});

// =============================================
// COURSE ACCESS TIER
// =============================================
describe('getCourseAccessTier', () => {
  it('returns free for null/undefined access', () => {
    expect(getCourseAccessTier(null)).toBe('free');
    expect(getCourseAccessTier(undefined)).toBe('free');
  });

  it('returns tier for active access', () => {
    expect(getCourseAccessTier(makeAccess({ accessTier: 'premium' }))).toBe('premium');
    expect(getCourseAccessTier(makeAccess({ accessTier: 'vip' }))).toBe('vip');
  });

  it('returns free for expired access', () => {
    const expired = makeAccess({
      accessTier: 'vip',
      expiresAt: new Date(Date.now() - 86400000).toISOString(),
    });
    expect(getCourseAccessTier(expired)).toBe('free');
  });

  it('returns free for cancelled access', () => {
    const cancelled = makeAccess({ accessTier: 'premium', status: 'cancelled' });
    expect(getCourseAccessTier(cancelled)).toBe('free');
  });
});

// =============================================
// ACCESS DENIED REASONS
// =============================================
describe('getAccessDeniedReason', () => {
  it('returns null for accessible lessons', () => {
    const profile = makeProfile();
    const access = makeAccess({ accessTier: 'vip' });
    expect(getAccessDeniedReason(profile, access, makeLesson('premium'))).toBeNull();
    expect(getAccessDeniedReason(null, null, makeLesson('free'))).toBeNull();
  });

  it('returns login message for guest on paid lesson', () => {
    const reason = getAccessDeniedReason(null, null, makeLesson('premium'));
    expect(reason).toContain('đăng nhập');
  });

  it('returns purchase message for user without access on premium lesson', () => {
    const profile = makeProfile();
    const reason = getAccessDeniedReason(profile, null, makeLesson('premium'));
    expect(reason).toContain('Mua');
  });

  it('returns VIP upgrade message for vip lesson', () => {
    const profile = makeProfile();
    const reason = getAccessDeniedReason(profile, null, makeLesson('vip'));
    expect(reason).toContain('VIP');
  });
});

describe('getLessonCTALabel', () => {
  it('returns correct labels', () => {
    expect(getLessonCTALabel('free')).toContain('miễn phí');
    expect(getLessonCTALabel('premium')).toContain('Mua');
    expect(getLessonCTALabel('vip')).toContain('VIP');
  });
});

describe('accessTierLabel', () => {
  it('returns display labels', () => {
    expect(accessTierLabel('free')).toBe('Free');
    expect(accessTierLabel('premium')).toBe('Premium');
    expect(accessTierLabel('vip')).toBe('VIP');
  });
});
