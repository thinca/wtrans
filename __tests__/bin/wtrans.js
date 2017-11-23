describe("wtrans", () => {
  it("executes command", () => {
    const mockFunc = jest.fn();
    jest.mock("../../lib/command", () => {
      return mockFunc;
    });
    const exit = jest.spyOn(process, "exit").mockImplementation(() => {});
    require("../../bin/wtrans");
    expect(mockFunc).toBeCalled();
    exit.mockRestore();
  });
});
