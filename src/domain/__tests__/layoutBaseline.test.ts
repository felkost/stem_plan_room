/**
 * БАЗОВЕ розташування (еталон): знімок усіх даних плану станом на 2026-07-17
 * (джерело — Home.xml із «каб інф.sh3d»).
 *
 * Будь-яка зміна координат у classroomLayout.ts «завалить» цей тест —
 * це навмисно: зміни в плануванні мають бути свідомими. Після узгодження
 * нового планування еталон оновлюється командою: npx vitest run -u
 */
import { describe, expect, it } from 'vitest';
import * as layout from '../classroomLayout';

describe('базове розташування об’єктів (еталон плану)', () => {
  it('кімната', () => {
    expect(layout.ROOM).toMatchSnapshot();
  });

  it('учнівські місця: столи, монітори, крісла', () => {
    expect({
      desks: layout.STUDENT_DESKS,
      monitors: layout.MONITORS,
      chairs: layout.STUDENT_CHAIRS,
    }).toMatchSnapshot();
  });

  it('зона вчителя та фронт класу', () => {
    expect({
      teacherDesk: layout.TEACHER_DESK,
      teacherChair: layout.TEACHER_CHAIR,
      teacherMonitor: layout.TEACHER_MONITOR,
      displayCabinet: layout.DISPLAY_CABINET,
      chalkboard: layout.CHALKBOARD,
      interactivePanel: layout.INTERACTIVE_PANEL,
      frontCabinet: layout.FRONT_CABINET,
      frontChair: layout.FRONT_CHAIR,
    }).toMatchSnapshot();
  });

  it('техніка, арена, отвори, світло, камери', () => {
    expect({
      workTable: layout.WORK_TABLE,
      networkSwitch: layout.NETWORK_SWITCH,
      powerStation: layout.POWER_STATION,
      arena: layout.ARENA,
      eastWindows: layout.EAST_WINDOWS,
      alcoveWindows: layout.ALCOVE_WINDOWS,
      westDoor: layout.WEST_DOOR,
      ceilingLights: layout.CEILING_LIGHTS,
      cameraPresets: layout.CAMERA_PRESETS,
    }).toMatchSnapshot();
  });
});
