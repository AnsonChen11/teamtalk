const app = require("../../middleware/app");
const User = require("../../models/userModel");
const authController = require("../../controllers/authController");
const request = require("supertest");
const bcrypt = require("bcrypt");


// describe("POST /users/login", () => {
//     test("should respond with a 200 status code and token if the email and password are correct", async () => {
//         // Create a user with a known email and password
//         const email = "test@example.com";
//         const password = "password123";
//         const user = new User({
//             email,
//             password: await bcrypt.hash(password, 10),
//         });
//         await user.save();

//         // Make a request to the login endpoint with the correct email and password
//         const response = await request(app)
//         .post("/users/login")
//         .send({ username, email, password });

//         // Expect a 200 status code and a token in the response
//         expect(response.statusCode).toBe(200);
//         expect(response.body.token).toBeDefined();

//         // Clean up by deleting the user
//         await user.delete();
// });

//     test("should respond with a 400 status code if the email is not found", async () => {
//         // Make a request to the login endpoint with a non-existent email
//         const response = await request(app)
//         .post("/users/login")
//         .send({ email: "nonexistent@example.com", password: "password123" });

//         // Expect a 400 status code and an error message in the response
//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(true);
//         expect(response.body.message).toBe("Email not found.");
//     });

//     test("should respond with a 400 status code if the password is incorrect", async () => {
//         // Create a user with a known email and password
//         const email = "test@example.com";
//         const password = "password123";
//         const user = new User({
//             email,
//             password: await bcrypt.hash(password, 10),
//         });
//         await user.save();

//         // Make a request to the login endpoint with the correct email but incorrect password
//         const response = await request(app)
//         .post("/users/login")
//         .send({ email, password: "wrongpassword" });

//         // Expect a 400 status code and an error message in the response
//         expect(response.statusCode).toBe(400);
//         expect(response.body.error).toBe(true);
//         expect(response.body.message).toBe("Password is incorrect.");

//         // Clean up by deleting the user
//         await user.delete();
//     });
// });

describe("POST /users/signup", () => {
    describe("POST /users/signup", () => {
        const reqBody = {
            username: "testuser",
            email: "testuser@example.com",
            password: "password",
            defaultPictureData: "data:image/jpeg;base64,/9j/4AAQSkZJRgA"
        };
      
        let saveSpy;
        let uploadSpy;
      
        beforeEach(() => {
            saveSpy = jest.spyOn(User.prototype, "save");
            uploadSpy = jest.spyOn(authController, "uploadDefaultPicture");
        });
      
        afterEach(() => {
            saveSpy.mockRestore();
            uploadSpy.mockRestore();
        });
      
        test("should respond with a 200 status code if the user is created successfully", async () => {
            saveSpy.mockResolvedValueOnce();
            uploadSpy.mockImplementationOnce(() => {});
        
            const response = await request(app)
                .post("/users/signup")
                .send(reqBody);
        
            expect(response.status).toBe(200);
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(uploadSpy).toHaveBeenCalledTimes(1);
        });
      
        test("should respond with a 400 status code if the email is already taken", async () => {
            saveSpy.mockRejectedValueOnce(new Error("Email already exists."));
        
            const response = await request(app)
                .post("/users/signup")
                .send(reqBody);
        
            expect(response.status).toBe(400);
            expect(response.body.error).toBe(true);
            expect(response.body.message).toBe(
                "Email is already taken or the registration information is incorrect."
            );
        });

        test("should respond with a 500 status code if there is an error during signup", async () => {
            saveSpy.mockRejectedValueOnce(new Error("Database error."));
        
            const response = await request(app)
              .post("/users/signup")
              .send(reqBody);
            expect(response.status).toBe(500);
            expect(response.body.error).toBe(true);
        });
    });
});

describe("DELETE /users/logout", () => {
    test("should respond with a 200 status code if the user successfully logs out", async () => {

        const response = await request(app)
          .delete("/users/logout")
    
        expect(response.status).toBe(200);
      });
});