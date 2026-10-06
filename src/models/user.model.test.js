import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./user.model.js";

test.after(() => {
    mongoose.deleteModel(/./);
});

test("User is registered as a mongoose model", () => {
    assert.equal(User.modelName, "User");
});

test("pre-save hashes the password so compare succeeds", async () => {
    const plain = "plain-password";
    const user = new User({
        username: "zixy",
        email: "zixy@example.com",
        fullname: "Zixy",
        avatar: "http://example.com/avatar.png",
        password: plain,
    });

    await User.schema.s.hooks.execPre("save", user, [{}]);

    assert.equal(typeof user.password, "string");
    assert.notEqual(user.password, "[object Promise]");
    assert.notEqual(user.password, plain);
    assert.equal(await bcrypt.compare(plain, user.password), true);
    assert.equal(await user.isPasswordCorrect(plain), true);
});
