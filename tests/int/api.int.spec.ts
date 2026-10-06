import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

// Access rules: members only ever see and change their own account and their own notebook.
let payload: Payload
let a: User, b: User
const stamp = Date.now()
const emails = [`owner-${stamp}@test.local`, `a-${stamp}@test.local`, `b-${stamp}@test.local`]
const as = (user: User) => ({ user, overrideAccess: false })

describe('access rules', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    // an existing account first, so the first-user-becomes-admin rule doesn't apply to A or B
    await payload.create({
      collection: 'users',
      data: { email: emails[0], password: 'pw-12345', role: 'member' },
    })
    ;[a, b] = await Promise.all(
      emails.slice(1).map((email) =>
        payload.create({
          collection: 'users',
          data: { email, password: 'pw-12345', role: 'member' },
        }),
      ),
    )
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', where: { email: { in: emails } } })
  })

  it('keeps members to their own account', async () => {
    const seen = await payload.find({ collection: 'users', ...as(a) })
    expect(seen.docs.map((d) => d.id)).toEqual([a.id])

    await expect(payload.findByID({ collection: 'users', id: b.id, ...as(a) })).rejects.toThrow()
    await expect(
      payload.update({ collection: 'users', id: b.id, data: { name: 'x' }, ...as(a) }),
    ).rejects.toThrow()

    // A can edit their own name, but a role change is ignored
    const self = await payload.update({
      collection: 'users',
      id: a.id,
      data: { name: 'Jordan', role: 'admin' },
      ...as(a),
    })
    expect(self.name).toBe('Jordan')
    expect(self.role).toBe('member')
  })

  it('rejects passwords under 8 characters', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { email: `short-${stamp}@test.local`, password: 'short', role: 'member' },
      }),
    ).rejects.toThrow(/8 characters/)
  })

  it('keeps notebook records private to their owner', async () => {
    // A tries to file a record under B; it lands in A's notebook instead
    const mine = await payload.create({
      collection: 'measurements',
      data: { date: '2026-09-24', weight: 178.8, owner: b.id },
      ...as(a),
    })
    const ownerId = (o: unknown) => (typeof o === 'object' && o ? (o as { id: number }).id : o)
    expect(ownerId(mine.owner)).toBe(a.id)

    const theirs = await payload.create({
      collection: 'measurements',
      data: { date: '2026-09-24', weight: 150, owner: b.id },
      ...as(b),
    })

    const aSees = await payload.find({ collection: 'measurements', ...as(a) })
    expect(aSees.docs.map((d) => d.id)).toEqual([mine.id])
    await expect(
      payload.findByID({ collection: 'measurements', id: theirs.id, ...as(a) }),
    ).rejects.toThrow()
    await expect(
      payload.delete({ collection: 'measurements', id: theirs.id, ...as(a) }),
    ).rejects.toThrow()

    // A can't hand their record to B either
    const kept = await payload.update({
      collection: 'measurements',
      id: mine.id,
      data: { owner: b.id },
      ...as(a),
    })
    expect(ownerId(kept.owner)).toBe(a.id)

    // visitors are turned away
    await expect(
      payload.find({ collection: 'measurements', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('deletes a notebook when its account is closed', async () => {
    await payload.create({
      collection: 'stickers',
      data: { tab: 'me', kind: 'star', x: 0.5, y: 100, owner: b.id },
      ...as(b),
    })
    await payload.delete({ collection: 'users', id: b.id })
    const left = await payload.find({ collection: 'stickers', where: { owner: { equals: b.id } } })
    const leftM = await payload.find({
      collection: 'measurements',
      where: { owner: { equals: b.id } },
    })
    expect(left.totalDocs + leftM.totalDocs).toBe(0)
  })
})
