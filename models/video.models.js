import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
videofile:{
    type: String,
    required: true,
},
thumbnail:{
    type: String,
    required: true,
},
owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},
title:{
    type: String,
    required: true,
    trim: true,
},
description:{
    type: String,
    required: true,
    trim: true,
},
duration:{
    type: String,
    required: true,
},
views:{
    type: Number,
    default: 0,
},
},{timestamps
:true
})
videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video", videoSchema);
export default Video;