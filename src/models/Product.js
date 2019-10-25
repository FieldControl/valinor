import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const ProductSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    createdAt:{
        type:Date,
        default: Date.now,
    },

});

ProductSchema.plugin(mongoosePaginate);

mongoose.model('Product', ProductSchema);