import React from "react";
import sampleQR from "../assets/sample-qr.png";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Tabs, Tab, Card, CardBody
} from "@heroui/react";

const ActionModalTriggerComponent = ({ buttonText, buttonClassName }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  let tabs = [
    {
      id: "ios",
      label: "IOS",
      content: sampleQR,
      caption:
        "Scan the QR code to instantly download the app on your iPhone via the App Store",
    },
    {
      id: "android",
      label: "Android",
      content: sampleQR,
      caption:
        "Scan the QR code to instantly download the app on your Android via the Play Store",
    },
    {
        id: "windows",
        label: "Windows",
        caption:
            "Scan the QR code to instantly download the app on your Windows via the Microsoft Store",
    }
  ];
  return (
    <>
      <Button className={buttonClassName} onPress={onOpen}>
        {buttonText}
      </Button>
      <Modal backdrop="opaque" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="font-inter-tight pt-3">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col font-bold text-4xl text-ink uppercase text-center">
                Get the MobConroller App
              </ModalHeader>
              <ModalBody>
                <div className="flex w-full flex-col">
                  <Tabs
                    aria-label="Dynamic tabs"
                    className="mx-auto"
                    items={tabs}
                  >
                    {(item) => (
                      <Tab  key={item.id} title={item.label}>
                        <Card>
                          <CardBody>
                            <p className="text-center text-lg font-medium py-5">
                              Scan the QR code to download the app
                            </p>
                            {item.content && (<img
                              src={item.content}
                              className="size-40 mx-auto"
                              alt=""
                            />)}
                            <p className="text-center py-3">{item.caption}</p>
                          </CardBody>
                        </Card>
                      </Tab>
                    )}
                  </Tabs>
                </div>
              </ModalBody>
              <ModalFooter className="">
                {/* <Button
                  className="bg-ink text-white mx-auto"
                  variant="solid"
                  radius="xs"
                  onPress={onClose}
                >
                  Yes, I scanned the QR code
                </Button> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ActionModalTriggerComponent;
