const { PostTypes } = require("../controllers/types/types");

class TextPost {
  constructor(text) {
    this.text = text;
  }

  getFormattedData = () => {
    return {
      type: PostTypes.Text,
      content: {
        text: this.text,
      },
      engagement: {
        likes: [],
        comments: [],
      },
    };
  };
}

exports.TextPost = TextPost;