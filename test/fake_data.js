const blocks = [
  {
    id: 1,
    user_id: 1,
    folder_id: "A100",
    timestamp: 100,
    remove: 0

  },
  {
    id: 2,
    user_id: 1,
    folder_id: "B100",
    timestamp: 101,
    remove: 0

  }
];

const users = [
  {
    id: 1,
    provider: "native",
    email: "test1@gmail.com",
    password: "test1"
  }
];

module.exports = { blocks, users };
