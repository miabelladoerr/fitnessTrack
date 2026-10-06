import { APIError, type Access, type CollectionConfig } from 'payload'

import { adminOnly, isAdmin } from '../access'

const NOTEBOOK = ['measurements', 'workouts', 'routines', 'food-entries', 'stickers'] as const

// Admins manage everyone; members only ever see and edit their own account.
const adminOrSelf: Access = ({ req: { user } }) =>
  isAdmin(user) ? true : user ? { id: { equals: user.id } } : false

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
    beforeValidate: [
      ({ data }) => {
        if (typeof data?.password === 'string' && data.password.length < 8)
          throw new APIError('Use a password with at least 8 characters.', 400, undefined, true)
        return data
      },
    ],
    // closing an account deletes that person's notebook first (records can't exist without an owner)
    beforeDelete: [
      async ({ id, req }) => {
        for (const collection of NOTEBOOK) {
          await req.payload.delete({
            collection,
            where: { owner: { equals: id } },
            req,
            overrideAccess: true,
          })
        }
      },
    ],
    beforeChange: [
      // the very first account becomes the admin, so someone can always get into the dashboard
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({
            collection: 'users',
            overrideAccess: true,
          })
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
    {
      // the About Me page
      name: 'profile',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'age', type: 'number', min: 13, max: 100 },
            { name: 'heightIn', type: 'number', label: 'Height (in)', min: 36, max: 96 },
            {
              name: 'calorieFormula',
              type: 'select',
              options: [
                { label: 'Male body', value: 'm' },
                { label: 'Female body', value: 'f' },
              ],
            },
          ],
        },
        {
          name: 'goals',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Grow glutes', value: 'glutes' },
            { label: 'Tone up', value: 'tone' },
            { label: 'Bulk up', value: 'bulk' },
            { label: 'Get stronger', value: 'strong' },
            { label: 'Lose fat', value: 'lose' },
            { label: 'Improve stamina', value: 'stamina' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'trainingDays', type: 'number', min: 2, max: 6, defaultValue: 4 },
            { name: 'sessionMinutes', type: 'number', min: 30, max: 120, defaultValue: 60 },
            {
              name: 'experience',
              type: 'select',
              defaultValue: 'int',
              options: [
                { label: 'Beginner', value: 'beg' },
                { label: 'Intermediate', value: 'int' },
                { label: 'Advanced', value: 'adv' },
              ],
            },
            {
              name: 'location',
              type: 'select',
              defaultValue: 'gym',
              options: [
                { label: 'At home', value: 'home' },
                { label: 'At a gym', value: 'gym' },
              ],
            },
          ],
        },
        // gear ids from the notebook's equipment lists, e.g. "barbell", "miniband"
        { name: 'equipment', type: 'text', hasMany: true },
        {
          name: 'goEasyOn',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Lower back', value: 'back' },
            { label: 'Shoulders', value: 'shoulder' },
            { label: 'Knees', value: 'knee' },
          ],
        },
        {
          name: 'measurementTargets',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'measure',
                  type: 'select',
                  required: true,
                  options: ['weight', 'waist', 'hips', 'chest', 'arm', 'thigh', 'bf'],
                },
                { name: 'value', type: 'number', required: true, min: 0 },
              ],
            },
          ],
        },
        {
          name: 'liftTargets',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'lift',
                  type: 'select',
                  required: true,
                  options: ['bench', 'squat', 'deadlift', 'ohp', 'thrust'],
                },
                { name: 'oneRepMaxLb', type: 'number', required: true, min: 0 },
              ],
            },
          ],
        },
      ],
    },
  ],
}
