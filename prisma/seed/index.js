import test from "../test/index.js";

async function main() {
  console.log("...seeding db");
  const members = await test.randMember();
  const authors = await test.randAuthor();
  const posts = await test.randPost(authors.authors);
  const comments = await test.randCommentOnPosts(members.at(0).id, posts);
  console.log("done");
}

main();
