import type { Access, CollectionConfig, FieldAccess } from 'payload'

// Admins manage everyone; members only ever see and edit their own account.
const isAdmin = (user: unknown) => (user as { role?: string } | null)?.role === 'admin'
const adminOrSelf: Access = ({ req: { user } }) => (isAdmin(user) ? true : user ? { id: { equals: user.id } } : false)
const adminOnly: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'createdAt'],
  },
  auth: true,
  access: {
    admin: ({ req: { user } }) => isAdmin(user), // only admins can open /admin
    create: () => true, // ponytail: open sign-up; switch to adminOnly for invite-only
    read: adminOrSelf,
    update: adminOrSelf,
    delete: ({ req: { user } }) => isAdmin(user),
  },
  hooks: {
    beforeChange: [
      // the very first account becomes the admin, so someone can always get into the dashboard
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    // email and password come from auth: true
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Admin', value: 'admin' },
      ],
      // members can't promote themselves
      access: { create: adminOnly, update: adminOnly },
      saveToJWT: true,
    },
  ],
}
