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

class VideoPost {
  constructor(text, video) {
    this.text = text;
    this.video = video;
  }

  getFormattedData = () => {
    return {
      type: PostTypes.Video,
      content: {
        text: this.text,
        video: this.video,
      },
      engagement: {
        likes: [],
        comments: [],
      },
    };
  };
}
exports.VideoPost = VideoPost;

class PDFPost {
  constructor(text, pdfSrc) {
    this.text = text;
    this.pdfSrc = pdfSrc;
  }

  getFormattedData = () => {
    return {
      type: PostTypes.Pdf,
      content: {
        text: this.text,
        pdfSrc: this.pdfSrc,
      },
      engagement: {
        likes: [],
        comments: [],
      },
    };
  };
}
exports.PDFPost = PDFPost;
