import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req,res) => {
    res.status(200).json({
        message : "User registered successfully"
    })
})

export { registerUser };