import { describe, expect, it } from 'vitest'
import { mergeSet } from './mergeSet'

describe('mergeSet', () => {
  it('unions local and remote on the first sync, inserting only local-only items', () => {
    expect(mergeSet([1, 2], [3, 4], null)).toEqual({ merged: [3, 4, 1, 2], toInsert: [1, 2], toDelete: [] })
  })

  it('does not resurrect an item removed on another device', () => {
    const result = mergeSet([1, 2], [1], [1, 2])
    expect(result.merged).toEqual([1])
    expect(result.toInsert).toEqual([])
  })

  it('deletes remotely an item removed locally', () => {
    expect(mergeSet([1], [1, 2], [1, 2])).toEqual({ merged: [1], toInsert: [], toDelete: [2] })
  })

  it('inserts remotely an item added locally', () => {
    expect(mergeSet([1, 2, 3], [1, 2], [1, 2])).toEqual({ merged: [1, 2, 3], toInsert: [3], toDelete: [] })
  })

  it('keeps an item added on both sides once, with nothing to insert', () => {
    expect(mergeSet([1, 5], [1, 5], [1])).toEqual({ merged: [1, 5], toInsert: [], toDelete: [] })
  })

  it('keeps items added on the other device', () => {
    expect(mergeSet([1], [1, 7], [1])).toEqual({ merged: [1, 7], toInsert: [], toDelete: [] })
  })

  it('does nothing when everything already agrees', () => {
    expect(mergeSet([1, 2], [1, 2], [1, 2])).toEqual({ merged: [1, 2], toInsert: [], toDelete: [] })
  })
})
