import {
  $, delay, replaceText, screenshot, tap,
  tapAlertCancelButton,
  tapAlertOKButton, tapReturnKey,
  tapSingularAlertButton, waitToNavigate, waitToShow, waitToStart
} from "../../util/TestUtil";
import {Assistant, CONFIG} from "../../testSuite.e2e";

export const SphereEditMenu_start = () => {
  test('should be on the SphereOverview view', async () => {
    await waitToStart('SphereOverview');
    await screenshot();
  })

  test('should go to the SphereEdit menu when you tap edit', async () => {
    await tap('editSphere')
    await waitToNavigate('SphereEdit');
    await screenshot();
  })
};
