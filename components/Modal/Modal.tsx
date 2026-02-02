import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";

interface LoaderProps {
  loadingRef: React.RefObject<BottomSheetModal>;
  children: any;
}

const Modal: React.FC<LoaderProps> = ({ loadingRef, children }) => {
  const snapPoints = useMemo(() => ["40%"], []);

  return (
    <BottomSheetModal
      ref={loadingRef}
      index={0}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1} // disappear immediately when modal closes
          appearsOnIndex={0} // appear immediately when modal opens
          pressBehavior="close" // tap on backdrop closes modal immediately
          opacity={0.7} // semi-transparent
        />
      )}
    >
      <BottomSheetView style={styles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default Modal;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
