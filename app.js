// IMPORT CONFIG AND DEPENDENCIES
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const multer = require('multer');
const Cryptr = require('cryptr')
const cryptr = new Cryptr('myTotalySecretKey');
var fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
io.setMaxListeners(0);
// IMPORT DATABASE
const sequelize = require('./database/database');

// IMPORT MODELS
const User = require('./model/user')
const User_Roles = require('./model/user_roles')
const Group = require('./model/group')
const Chat = require('./model/chat')
const Post = require('./model/post')
const Like = require('./model/like')
const Comment = require('./model/comment')
const Story = require('./model/story')
const Conversation = require('./model/conversation')
//Import Route
const authRoutes = require('./routes/auth/auth')
const adminRoutes = require('./routes/admin/admin')
const userRoutes = require('./routes/user/user');
const { memoryStorage } = require('multer');




const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})


const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }

}



app.use(bodyParser.json());  // application-json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// app.use('./images',express.static(path.join(__dirname,'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.io = io;
    next();
})


// app.use((req,res,next)=>{
// User.findByPk(1).then((user)=>{
//   req.user=user;
//   next();
// }).catch((err)=>{
//   console.log(err)
// });
// })

io.on('connection', socket => {
    console.log(socket.id, "socket=====")
    let user = {}
    socket.on('user_connected', user => {
        console.log(user)
        socket.id = user.id
        socket.emit("connected", socket.id)

    })

    socket.on('join_room' , (room)=>{
        console.log(room , "jo,ned")
            socket.join(room)
    })

    socket.on('send_message', (message) => {
        console.log(socket.id)
        // console.log(message, '======',message.id)
        io.emit('new_message', message)


        const encodeMessage = cryptr.encrypt(message.message)
        console.log(cryptr.decrypt(encodeMessage), "==0====", encodeMessage)

        return Conversation.findAll({
            where: {
                id: message.conversationId != undefined ? message.conversationId : 0
            },
            required: false

        })
            .then((result) => {
                console.log("result", encodeMessage)
                if (result.length === 0) {
                    return Conversation.create({
                        users: [2, 3, 4],
                        roleName: "users",
                        firstUser: "2",
                        lastMessage: encodeMessage,
                        notification: "merhaba",
                        deleted: false
                    })

                } else {
                    console.log("result", encodeMessage)
                    return Chat.create({
                        senderId: 3,
                        conversationId: 2,
                        message: encodeMessage,
                        deleted: false,
                        conversationId: message.conversationId
                    })
                        .then((result => {
                            console.log("err", result)
                            Conversation.update({
                                lastMessage: encodeMessage
                            },
                                {
                                    where: {
                                        id: message.conversationId,
                                    }
                                }
                            )
                        }))
                        .catch((err) => {
                            console.log("rews")

                        })
                }

            })
            .then(response => {

                console.log(response, "respkne")
                if (response != undefined) {
                    return Chat.create({
                        senderId: 3,
                        conversationId: 2,
                        message: encodeMessage,
                        deleted: false,
                        conversationId: response.id
                    })

                }
            })
            .then((data) => {
                console.log(data , "dataaaaaa")
                if (data != undefined || data != null) {
                   console.log(data)
                }
            })
            .catch((err) => {
                console.log("333", err)

            })

    })

})


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes)

app.use(helmet());
app.use(compression());


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});


// RELASHIONSHIP DB

User.hasOne(User_Roles)

User.hasMany(Conversation)
Conversation.belongsTo(User)

Group.hasMany(Post)
Post.belongsTo(Group)

Conversation.hasMany(Chat)
Chat.belongsTo(Conversation)

User.hasMany(Group)
Group.belongsTo(User)

User.hasMany(Story)
Story.belongsTo(User)




User.hasMany(Post)
Post.belongsTo(User)


Post.hasMany(Comment)
Comment.belongsTo(Post)

Post.hasMany(Like)
Like.belongsTo(Post)


// 1 group Admin 2 user
let userData = null;
sequelize
    .sync()
    .then((result) => {
        console.log(result);
        return User.findByPk(1);
    })
    .then((user) => {
        if (!user) {
            return User.create({
                email: "socialnetwork@yatoo.com",
                name: "Fatih",
                password: "Admin",
                photo: "null",
                type: 'Admin',
                telephone: "123123",
                surname: "wefsdf",
                deleted: false
            })
        }
        return user;
    })
    .then((user) => {

        userData = user;
        return User_Roles.findByPk(1);
    })
    .then((UserRole) => {
        console.log("kjsfnv ", userData.id);
        if (!UserRole) {
            return User_Roles.create({
                roleName: "Admin",
                userId: userData.id,
                deleted: false
            })
        }
        return UserRole
    })
    .then((UserRole) => {
        // const dir = './images';
        // if (!fs.existsSync(dir)) {
        //   fs.mkdirSync(dir);
        // }
        console.log(UserRole);
        http.listen(process.env.PORT || 3000);

    })
    .catch(err => {
        console.log(err);
    });





