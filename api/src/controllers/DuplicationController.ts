import {Request} from 'express';
import {
  Body, Post, Param, Req, JsonController, UseBefore, Authorized, InternalServerError
} from 'routing-controllers';
import passportJwtMiddleware from '../security/passportJwtMiddleware';
import {IUnit} from '../../../shared/models/units/IUnit';
import {Lecture} from '../models/Lecture';
import {ILecture} from '../../../shared/models/ILecture';
import {Unit} from '../models/units/Unit';
import {ICourse} from '../../../shared/models/ICourse';
import {Course} from '../models/Course';


@JsonController('/duplicate')
@UseBefore(passportJwtMiddleware)
@Authorized(['teacher', 'admin'])
export class DuplicationController {

  @Post('/course/:id')
  duplicateCourse(@Param('id') id: string, @Body() data: any, @Req() request: Request) {
    const courseAdmin = data.admin;
    return Course.findById(id)
      .then((course: ICourse) => {
        return new Course(course).export();
      }).then((exportedCourse: ICourse) => {
        return Course.import(exportedCourse, courseAdmin);
      })
      .catch((err: Error) => {
        const newError = new InternalServerError('Failed to duplicate course');
        newError.stack += '\nCaused by: ' + err.message + '\n' + err.stack;
        throw newError;
      });
  }

  @Post('/lecture/:id')
  duplicateLecture(@Param('id') id: string, @Body() data: any, @Req() request: Request) {
    const courseId = data.courseId;
    return Lecture.findById(id)
      .then((lecture: ILecture) => {
        return new Lecture(lecture).export();
      }).then((exportedLecture: ILecture) => {
        return Lecture.import(exportedLecture, courseId);
      })
      .catch((err: Error) => {
        const newError = new InternalServerError('Failed to duplicate lecture');
        newError.stack += '\nCaused by: ' + err.message + '\n' + err.stack;
        throw newError;
      });
  }

  @Post('/unit/:id')
  duplicateUnit(@Param('id') id: string, @Body() data: any, @Req() request: Request) {
    const courseId = data.courseId;
    const lectureId = data.lectureId;
    return Unit.findById(id)
      .then((unit: IUnit) => {
        return new Unit(unit).export();
      }).then((exportedUnit: IUnit) => {
        return Unit.import(exportedUnit, courseId, lectureId);
      })
      .catch((err: Error) => {
        const newError = new InternalServerError('Failed to duplicate unit');
        newError.stack += '\nCaused by: ' + err.message + '\n' + err.stack;
        throw newError;
      });
  }

}
