import mongoose , {mongoose, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String , //cloudnary url
            required : true
        },
        thumbnail : {
            type : String , // cloudnary url
            required : true
        },
        title : {
            type : String , 
            required : true
        },
        description : {
            type : String , 
            required : true
        },
        duration : {
            type : Number , 
            required : true
        },
        views : {
            type : Number ,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true 
    }
)



videoSchema.plugin(mongooseAggregatePaginate) // plugin adds the aggregatePaginate method to the schema, enabling you to use pagination directly with Mongoose aggregation queries. Without applying the plugin, the aggregatePaginate method will not be available.
export const Video = mongoose.model("Video" , videoSchema)