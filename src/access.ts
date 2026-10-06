import type { Access, CollectionBeforeValidateHook, Field, FieldAccess } from 'payload'

export const isAdmin = (user: unknown) => (user as { role?: string } | null)?.role === 'admin'

export const adminOnly: FieldAccess = ({ req: { user } }) => isAdmin(user)

// Rules for anything a member owns: admins see all, members only their own, visitors nothing.
export const ownerAccess = {
  create: (({ req: { user } }) => Boolean(user)) as Access,
  read: (({ req: { user } }) =>
    isAdmin(user) ? true : user ? { owner: { equals: user.id } } : false) as Access,
  update: (({ req: { user } }) =>
    isAdmin(user) ? true : user ? { owner: { equals: user.id } } : false) as Access,
  delete: (({ req: { user } }) =>
    isAdmin(user) ? true : user ? { owner: { equals: user.id } } : false) as Access,
}

export const ownerField: Field = {
  name: 'owner',
  type: 'relationship',
  relationTo: 'users',
  required: true,
  index: true,
  // members can't file records under someone else
  access: { update: adminOnly },
  admin: { position: 'sidebar' },
}

// New records belong to whoever creates them (admins may set another owner).
// Runs before validation so the required owner is filled in first.
export const setOwner: CollectionBeforeValidateHook = ({ data, operation, req: { user } }) => {
  if (data && operation === 'create' && user && (!isAdmin(user) || !data.owner))
    data.owner = user.id
  return data
}
