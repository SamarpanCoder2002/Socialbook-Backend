exports.ConnectionRequest = (req, res) => {
    console.log(req.body.sender);
    console.log(req.body.receiver);

    return res.status(200).json({
        message: "Connection request sent"
    });
}