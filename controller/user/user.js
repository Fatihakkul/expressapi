
const { Op } = require('sequelize')


const Post = require('../../model/post')
const User = require('../../model/user')
const Comment = require('../../model/comment')
const Like = require('../../model/like')
const Group = require('../../model/group')
const User_Roles = require('../../model/user_roles')
const Conversation = require('../../model/conversation')
const Chat = require('../../model/chat')






exports.testMetodAuth = (req, res, next) => {
    res.status(200).json({
        posts: [{ title: 'First Post', content: 'this is the first Content' }]
    });
}

exports.sendPost = (req, res, next) => {
    const { post, userId,groupId } = req.body

    return Post.create({
        post: post,
        userId: userId,
        groupId,
        deleted: false
    })
        .then((post) => {
            if (post != undefined) {
                res.status(200).json({
                    response: post,
                    responseStatus: 200,
                    responseMessage: "Created post"
                })
            }
            else {
                res.status(200).json({
                    response: null,
                    responseStatus: 400,
                    responseMessage: " not Created post"
                })
            }
        })
        .catch((err) => {
            res.status(200).json({
                responseStatus: 401,
                response: err,
                responseMessage: "error"
            });

        })

}

exports.likePost = (req, res, next) => {
    const { postId, userId } = req.body

    return Like.create({
        postId,
        deleted: false
    })
        .then(like => {
            if (like != undefined) {
                res.status(200).json({
                    response: like.postId,
                    responseMessage: "Success",
                    responseStatus: 200
                })
            }
        })
        .catch((err) => {
            res.status(200).json({
                responseStatus: 401,
                response: err,
                responseMessage: "error"
            });

        })
}
exports.commentPost = (req, res, next) => {
    const { postId, comment } = req.body

    return Comment.create({
        postId,
        comment,
        deleted: false
    })
        .then((comment) => {
            if (comment != undefined) {
                res.status(200).json({
                    response: comment,
                    responseStatus: 200,
                    responseMessage: "Comment success"
                })
            }
        })
        .catch((err) => {
            res.status(200).json({
                responseStatus: 401,
                response: err,
                responseMessage: "error"
            });

        })
}

exports.getPostDetail = (req, res, next) => {
    const { postId } = req.body
    console.log(postId)
    return Post.findAll({
        where: {
            id: postId

        },
        include: [
            {
                model: Comment,
                where: {
                    postId,
                    deleted: false
                },
                required : false
            },
            {
                model: Like,
                where: {
                    postId,
                    deleted: false
                },
                required : false
            }
        ]
    })
        .then(result => {
            console.log("merhab" ,result)
            if (result != undefined || result == null)  {
                console.log("resultv========")
                res.status(200).json({
                    response: result[0],
                    responseMessage: "Post Detail",
                    responseStatus: 200
                })
            }
        })
        .catch((err) => {
            res.status(200).json({
                responseStatus: 401,
                response: err,
                responseMessage: "error"
            });

        })
}
exports.getAllPost = (req, res, next) => {
    const { userId ,groupId} = req.body

    return Post.findAll({
        where : {
            groupId,
        }
    })
        .then((result) => {
            if (result.length > 0) {
                res.status(200).json({
                    response: result,
                    responseMessage: "all post",
                    responseStatus: 200
                })
            }
            else {
                res.status(200).json({
                    response: [],
                    responseMessage: "all post",
                    responseStatus: 200
                })
            }
        })
        .catch((err) => {
            res.status(200).json({
                responseStatus: 401,
                response: err,
                responseMessage: "error"
            });

        })
}

exports.createGroup = (req, res, next) => {
    const { userId } = req.body

    let groupData =[];
    return Group.create({
        userId,
        deleted: false
    })
        .then((group) => {
            
            groupData=group
            if (group != undefined) {
               
                return  User_Roles.update({
                    roleName: "adminGroup"
                },
                    {
                        where: {
                            userId,
                        }
                    }
                )
            }

        })
        .then((result) => {
            console.log("created result")
            if (result != undefined) {
                io.emit("chat",result)
                res.status(200).json({
                    response: groupData,
                    responseMessage: "Created group",
                    responseStatus: 200
                })
               
            }
        })
        .catch((err) => {
            res.status(200).json({
                responseStatus: 401,
                response: err,
                responseMessage: "error"
            });

        })
}

exports.getMessageDetail =(req,res,next)=>{
    const {conversationId} = req.body


    return Chat.findAll({
        where : {
            conversationId,
        }
      
    })
    .then(response=>{
        if(response != undefined || response != null){
            res.status(200).json({
                response : response,
                responseMessage : "all message",
                responseStatus  :200
            })
        }else {
            res.status(200).json({
                response : [],
                responseMessage : "all message",
                responseStatus  :200
            })
        }
    })
    .catch((err) => {
        res.status(200).json({
            responseStatus: 401,
            response: err,
            responseMessage: "error"
        });

    })

}


exports.getMessage=(req,res,next)=>{
    const { conversationId } = req.body

    return Conversation.findAll({
        where : {
            id : conversationId
        }
    })
    .then((result)=>{
        
        if(result.length >0 || result != undefined){
            console.log(result[0].users.split(' '))
            res.status(200).json({
                response :{
                    users : result[0].users.split(' '),
                    id: conversationId,
                    roleName:result[0].roleName,
                    firstUser: result[0].firstUser,
                    lastMessage: result[0].lastMessage,
                    notification:result[0].roleName,
                    deleted: result[0].deleted,
                    createdAt: result[0].createdAt,
                    updatedAt:result[0].updatedAt,
                    userId:result[0].userId

                },
                responseMessage : "All message",
                responseStatus : 200
            })
        }else {
            res.status(200).json({
                responseStatus: 401,
                response: err,
                responseMessage: "error"
            });
        }
    })
    .catch((err) => {
        res.status(200).json({
            responseStatus: 401,
            response: err,
            responseMessage: "error"
        });

    })


}

exports.getUserMessage=(req,res,next)=>{
    const {userId} = req.body
console.log(userId)
    return Conversation.findAll({
        where : {
            users : {
                [Op.substring] : userId 
            }
        }
    })
    .then((result)=>{
        console.log(result)
        if(result.length > 0 || result != undefined || result != null){
            res.status(200).json({
                response : result,
                responseMessage  :"asdasd",
                responseStatus : 200
            })
        }
    })
    .catch((err) => {
        res.status(200).json({
            responseStatus: 401,
            response: err,
            responseMessage: "error"
        });

    })

}