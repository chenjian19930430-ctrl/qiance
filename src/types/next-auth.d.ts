import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      phone: string;
      tenantId: string;
      role: string;
      permissions: string[];
    };
  }

  interface User {
    id: string;
    phone: string;
    tenantId: string;
    role: string;
    permissions: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phone: string;
    tenantId: string;
    role: string;
    permissions: string[];
  }
}
