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
    };
  };
}
exports.PDFPost = PDFPost;

class ImagePost {
  constructor(text, imagesCollection) {
    this.text = text;
    this.imagesCollection = imagesCollection;
  }

  getFormattedData = () => {
    return {
      type: PostTypes.Image,
      content: {
        text: this.text,
        imagesCollection: this.imagesCollection,
      },
    };
  };
}

exports.ImagePost = ImagePost;

class PollPost {
  constructor(text, question, options) {
    this.text = text;
    this.question = question;
    this.options = options.map((option) => {
      return {
        text: option,
        votes: 0,
      };
    });
  }
  getFormattedData = () => {
    return {
      type: PostTypes.Poll,
      content: {
        text: this.text,
        question: this.question,
        prevResults: this.options,
      },
    };
  };
}
exports.PollPost = PollPost;


