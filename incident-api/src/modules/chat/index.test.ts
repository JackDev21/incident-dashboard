import * as chatModule from "./index"

describe("chat module barrel", () => {
  it("exports chat service namespace", () => {
    expect(chatModule.chatService).toBeDefined()
    expect(chatModule.chatService.answerQuestion).toBeDefined()
  })

  it("exports controller and routes", () => {
    expect(chatModule.messageChat).toBeDefined()
    expect(chatModule.chatRoutes).toBeDefined()
  })
})
