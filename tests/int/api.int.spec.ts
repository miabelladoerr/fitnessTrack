import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

// Access rules for accounts: members see only themselves and can't promote themselves.
let payload: Payload
const stamp = Date.now()
const emails = [`owner-${stamp}@test.local`, `a-${stamp}@test.local`, `b-${stamp}@test.local`]

describe('Users access', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    // an existing account first, so the first-user-becomes-admin rule doesn't apply to A or B
    await payload.create({ collection: 'users', data: { email: emails[0], password: 'pw-12345' } })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', where: { email: { in: emails } } })
  })

  it('keeps members to their own account', async () => {
    const [a, b] = await Promise.all(
      emails.slice(1).map((email) => payload.create({ collection: 'users', data: { email, password: 'pw-12345', role: 'member' } })),
    )

    // what member A sees through the API
    const seen = await payload.find({ collection: 'users', user: a, overrideAccess: false })
    expect(seen.docs.map((d) => d.id)).toEqual([a.id])

    // A can't read or edit B
    await expect(payload.findByID({ collection: 'users', id: b.id, user: a, overrideAccess: false })).rejects.toThrow()
    await expect(
      payload.update({ collection: 'users', id: b.id, data: { name: 'x' }, user: a, overrideAccess: false }),
    ).rejects.toThrow()

    // A can edit their own name, but a role change is ignored
    const self = await payload.update({
      collection: 'users',
      id: a.id,
      data: { name: 'Jordan', role: 'admin' },
      user: a,
      overrideAccess: false,
    })
    expect(self.name).toBe('Jordan')
    expect(self.role).toBe('member')
  })
})
