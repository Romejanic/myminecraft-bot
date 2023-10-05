# Contributing to the project

MyMinecraft is an open source project, meaning you can view all of the bot's source code, make a copy of it to make your own changes, and then create a pull request to merge your changes into the main codebase.

The changes you make could range from fixing a bug, adding a new feature, cleaning up the code. Even something as simple as fixing a typo in the documentation will be greatly appreciated!

## Guidelines

Before creating your pull request however, please keep these guidelines in mind to increase your pull request's chances of being accepted.

### 1. Ensure good committing habits

You should commit as often as you can when adding something. After every new function/piece of functionality is added, make a new commit and push it to your fork. Don't add all of your changes in one commit (unless your changes are incredibly small).

### 2. Follow the style guide
My style guide for this project isn't super rigorous, but the main things to keep in mind are:

1. Use `const` for most variables. If you cannot use `const` use `let`. **NEVER** use `var`.
    ```typescript
    const staticVal = 123;           // prefer
    let changingVal = "hello world"; // if needed
    var badExample = {};             // never
    ```
2. When interpolating values into strings, use template literals rather than concatenation.
    ```typescript
    const value = `abc ${myVal}`; // good
    const value = "abc" + myVal;  // bad
    ```
3. Please use semicolons at the end of lines where it is permitted.
    ```typescript
    await someFunction(val); // good
    const math = 9 + 10      // bad
    ```
4. Use `async`/`await` at all times unless a promise is intended to return a value asynchronously. Just use your best judgement on where you think it's appropriate.
    ```typescript
    // good
    try {
        const value = await fetchSomething();
        process(value);
    } catch(e) {
        handleError(e);
    }

    // bad (unless async)
    fetchSomething()
        .then(value => process(value))
        .catch(err => handleError(err));
    ```

### 3. Pick good commit messages

Don't just write `done` or `fixed it`. Write a brief description of exactly what you changed (e.g. `Added admin check to /add and /remove`). Possibly even reference the specific issue in your commit (if applicable).

### 4. If responding to an issue, put it in a comment

If you are implementing a bug fix/new feature in response to an issue, include a comment above the changed code with a link to the issue on Github so it can be recalled later (e.g. `// fixed bug: https://github.com/.../issues/23`).

### 5. Be civil when making a pull request

When making your pull request, please describe as best you can what and how you changed the code. If responding to an issue, it is crucial that you include a link to it here (so Github can automatically link them together).

If your pull request gets accepted, awesome work! You're now an official contributor! If it doesn't, remain calm, read the reason it got rejected, then go back and make the necessary changes for it to be accepted.

### 6. Include your Discord username!

For extra fun, include your full Discord username (e.g. `@memedealer5011`) in your pull request description. If you're a member of this server when the pull request gets accepted, you will receive the Contributor rank and appear in the sidebar!

## Conclusion
Thank you for reading, and thanks for contributing to the project. Happy coding!