import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export interface Card extends Document {

    readonly _Id: mongoose.Schema.Types.ObjectId;

    readonly name: string

}

