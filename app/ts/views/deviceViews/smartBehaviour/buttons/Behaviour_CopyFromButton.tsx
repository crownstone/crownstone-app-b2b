import { Languages } from "../../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("Behaviour_CopyFromButton", key)(a,b,c,d,e);
}
import { colors } from "../../../styles";
import { core } from "../../../../Core";
import { StoneDataSyncer } from "../../../../backgroundProcesses/StoneDataSyncer";
import { Alert } from "react-native";
import { Button } from "../../../components/Button";
import * as React from "react";
import { NavigationUtil } from "../../../../util/NavigationUtil";
import { DataUtil } from "../../../../util/DataUtil";
import { StoneUtil } from "../../../../util/StoneUtil";
import { BehaviourCopySuccessPopup } from "../DeviceSmartBehaviour";
import { Permissions } from "../../../../backgroundProcesses/PermissionManager";

export function BehaviourCopyFromButton({sphereId, stoneId, rulesAvailable}) {
  return (
    <Button
      backgroundColor={colors.blue.rgba(0.5)}
      label={ lang("Copy_from___")}
      callback={() => {
        if (Permissions.inSphere(sphereId).canChangeBehaviours === false) {
          Alert.alert(
            lang("_You_dont_have_permission_t_header"),
            lang("_You_dont_have_permission_t_body"),
            [{text:lang("_You_dont_have_permission_t_left")}]);
          return
        }

        let copyFrom = () => {
          NavigationUtil.navigate("DeviceSmartBehaviour_CopyStoneSelection", {
            sphereId: sphereId,
            stoneId: stoneId,
            copyType: "FROM",
            originId: stoneId,
            callback: (fromStoneId, selectedRuleIds) => {
              let stoneName = DataUtil.getStoneName(sphereId, fromStoneId);
              Alert.alert(
                lang("Shall_I_copy_the_behaviou", stoneName),
                undefined,
                [{text:lang("Cancel")}, {text:lang("OK"), onPress:() => {
                    StoneUtil.copyRulesBetweenStones(sphereId, fromStoneId, stoneId, selectedRuleIds)
                      .then((success) => {
                        if (success) {
                          BehaviourCopySuccessPopup();
                        }
                      })
                  }}])
            }
          });
        }

        if (rulesAvailable) {
          Alert.alert(
            lang("_Copying_will_override_ex_header"),
            lang("_Copying_will_override_ex_body"),
            [{text:lang("_Copying_will_override_ex_left")}, {
              text:lang("_Copying_will_override_ex_right"), onPress: copyFrom}])
        }
        else{
          copyFrom()
        }
      }}
      icon={'md-log-in'}
      iconSize={14}
      iconColor={colors.blue.rgba(0.75)}
    />
  );
}