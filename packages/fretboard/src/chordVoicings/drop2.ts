export const drop2 = {
  degrees: [
    [1, 5, 7, 3],
    [3, 7, 1, 5],
    [5, 1, 3, 7],
    [7, 3, 5, 1],
  ],
  strings: {
    4: {
      maj7: [
        [null, null, 10, 12, 12, 12],
        [null, null, 2, 4, 1, 3],
        [null, null, 5, 5, 5, 7],
        [null, null, 9, 9, 8, 8],
      ],
    },
    5: {
      maj7: [
        [null, 3, 5, 4, 5, null],
        [null, 7, 9, 5, 8, null],
        [null, 10, 10, 9, 12, null],
        [null, 14, 14, 12, 13, null],
      ],
    },
    6: {
      maj7: [
        [8, 10, 9, 9, null, null],
        [12, 14, 10, 12, null, null],
        [3, 3, 2, 4, null, null],
        [7, 7, 5, 5, null, null],
      ],
    },
  },
} as const;
