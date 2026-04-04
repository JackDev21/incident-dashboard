import mongoose from "mongoose"
import { connectDB } from "./db"

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
  },
}))

describe("db config", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("throws when MONGODB_URI is missing", async () => {
    delete process.env.MONGODB_URI

    await expect(connectDB()).rejects.toThrow("MONGODB_URI is not defined in environment variables")
  })

  it("connects to mongodb and logs success", async () => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/test"
    const connectMock = mongoose.connect as unknown as jest.Mock
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})

    connectMock.mockResolvedValue(undefined)

    await connectDB()

    expect(connectMock).toHaveBeenCalledWith("mongodb://localhost:27017/test")
    expect(consoleLogSpy).toHaveBeenCalledWith("✅ MongoDB connected")

    consoleLogSpy.mockRestore()
  })
})
