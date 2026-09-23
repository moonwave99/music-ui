export const drop3 = {
  degrees: [
    [1, 7, 3, 5],
    [3, 1, 5, 7],
    [5, 3, 7, 1],
    [7, 5, 1, 3],
  ],
  strings: {
    6: {
      maj7: [
        [8, null, 9, 9, 8, null],
        [12, null, 10, 12, 12, null],
        [3, null, 2, 4, 1, null],
        [7, null, 5, 5, 5, null],
      ],
    },
    5: {
      maj7: [
        [null, 3, null, 4, 5, 3],
        [null, 7, null, 5, 8, 7],
        [null, 10, null, 9, 12, 8],
        [null, 14, null, 12, 13, 12],
      ],
    },
    4: null,
  },
} as const;
