import type { CollectionConfig, Field } from 'payload'

import { ownerAccess, ownerField, setOwner } from '../access'

// Everything a member writes in their notebook. Each record belongs to one user (see access.ts).
const owned = (config: Omit<CollectionConfig, 'access'>): CollectionConfig => ({
  ...config,
  access: ownerAccess,
  admin: { group: 'Notebook', ...config.admin },
  hooks: { ...config.hooks, beforeValidate: [setOwner, ...(config.hooks?.beforeValidate ?? [])] },
  fields: [ownerField, ...config.fields],
})

const num = (name: string, extra: Partial<Field> = {}): Field =>
  ({ name, type: 'number', min: 0, ...extra }) as Field
const date: Field = {
  name: 'date',
  type: 'date',
  required: true,
  index: true,
  admin: { date: { pickerAppearance: 'dayOnly' } },
}

export const Measurements = owned({
  slug: 'measurements',
  admin: { useAsTitle: 'date', defaultColumns: ['date', 'owner', 'weight', 'waist', 'bodyFat'] },
  fields: [
    date,
    num('weight', { label: 'Weight (lb)' }),
    num('waist', { label: 'Waist (in)' }),
    num('hips', { label: 'Hips (in)' }),
    num('chest', { label: 'Chest (in)' }),
    num('arm', { label: 'Upper arm (in)' }),
    num('thigh', { label: 'Thigh (in)' }),
    num('bodyFat', { label: 'Body fat (%)', max: 100 }),
  ],
})

export const Workouts = owned({
  slug: 'workouts',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date', 'owner'] },
  fields: [
    date,
    { name: 'title', type: 'text', required: true },
    {
      name: 'exercises',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { type: 'row', fields: [num('repLow'), num('repHigh'), num('targetRpe', { max: 10 })] },
        {
          name: 'sets',
          type: 'array',
          fields: [
            {
              type: 'row',
              fields: [
                num('weight', { label: 'Weight (lb)' }),
                num('reps'),
                num('rpe', { label: 'RPE', max: 10 }),
                { name: 'done', type: 'checkbox' },
              ],
            },
          ],
        },
      ],
    },
  ],
})

export const Routines = owned({
  slug: 'routines',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'owner', 'updatedAt'] },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'My routine' },
    {
      name: 'days',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true }, // e.g. "Mon · Upper A"
        {
          name: 'type',
          type: 'select',
          options: ['full', 'upper', 'lower', 'push', 'pull', 'legs'],
        },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'exercise', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'pattern', type: 'text' },
                num('sets'),
                { name: 'reps', type: 'text' },
                num('restSeconds'),
              ],
            },
          ],
        },
      ],
    },
  ],
})

export const FoodEntries = owned({
  slug: 'food-entries',
  admin: { useAsTitle: 'food', defaultColumns: ['food', 'date', 'meal', 'kcal', 'owner'] },
  fields: [
    date,
    {
      name: 'meal',
      type: 'select',
      required: true,
      options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    },
    { name: 'food', type: 'text', required: true },
    {
      type: 'row',
      fields: [num('kcal', { required: true }), num('protein'), num('carbs'), num('fat')],
    },
  ],
})

export const Stickers = owned({
  slug: 'stickers',
  admin: { useAsTitle: 'kind', defaultColumns: ['kind', 'tab', 'owner'] },
  fields: [
    {
      name: 'tab',
      type: 'select',
      required: true,
      options: ['me', 'log', 'routine', 'food', 'progress', 'library'],
    },
    { name: 'kind', type: 'text', required: true }, // sticker id from the sheet, e.g. "star"
    {
      type: 'row',
      fields: [
        num('x', { required: true, max: 1 }),
        num('y', { required: true }),
        { name: 'rotation', type: 'number' },
      ],
    },
  ],
})
