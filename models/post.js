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

  // makeInitialResults = (options) => {
  //   const resultsInitial = [];

  //   options.forEach((option) => {
  //     resultsInitial.push({
  //       text: option,
  //       votes: 0,
  //     });
  //   });

  //   return resultsInitial;
  // };

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
