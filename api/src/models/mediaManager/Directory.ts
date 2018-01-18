import {IDirectory} from '../../../../shared/models/mediaManager/IDirectory';
import {File} from './File';
import * as mongoose from 'mongoose';

interface IDirectoryModel extends IDirectory, mongoose.Document {

}

const directorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subDirectories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Directory'
    }
  ],
  files: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    }
  ]
}, {
    timestamps: true,
    toObject: {
      transform: function (doc: IDirectoryModel, ret: any) {
        ret._id = ret._id.toString();
        ret.subDirectories = ret.subDirectories.map((dir: any) => {
          if (!dir._id) {
            dir = dir.toString();
          }
          return dir;
        });
        ret.files = ret.files.map((file: any) => {
          if (!file._id) {
            file = file.toString();
          }
          return file;
        });
      }
    },
});

directorySchema.pre('remove', async function(next: () => void) {
  for (const subdir of this.subDirectories) {
    const model = await Directory.findById(subdir);
    if (model) {
      await model.remove();
    }
  }
  for (const file of this.files) {
    const model = await File.findById(file);
    if (model) {
      await model.remove();
    }
  }
  next();
});

const Directory = mongoose.model<IDirectoryModel>('Directory', directorySchema);

export {Directory, IDirectoryModel};
