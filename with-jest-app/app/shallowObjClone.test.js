const shallowObjClone = require("./shallowObjClone");

test("creates a shallow clone of the object parameter", () => {
  const myObj = { person: "ana", Number: 42 };
  expect(shallowObjClone(myObj)).toStrictEqual(myObj);
});
