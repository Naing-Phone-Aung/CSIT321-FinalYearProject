import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Tabs,
  Tab,
  Card,
  CardBody,
  Link, // Import the Link component from HeroUI
} from "@heroui/react";

const ActionModalTriggerComponent = ({ buttonText, buttonClassName }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // URLs for your application downloads
  const androidApkUrl = "https://github.com/Naing-Phone-Aung/CSIT321-FinalYearProject/releases/download/v1.0.0/MobControl.apk";
  const pcSetupUrl = "https://github.com/Naing-Phone-Aung/CSIT321-FinalYearProject/releases/download/v1.0.0/MobControlPC-setup.exe";
  const vigembusDriverUrl = "https://vigembusdriver.com/download/";

  let tabs = [
    {
      id: "android",
      label: "Android",
      content: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(androidApkUrl)}`,
      caption: "Scan the QR code to download the APK for your Android device.",
    },
    {
      id: "windows",
      label: "Windows",
      downloadUrl: pcSetupUrl,
      caption: "Download the setup file for your Windows PC.",
    },
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
                Get the MobControl App
              </ModalHeader>
              <ModalBody>
                <div className="flex w-full flex-col">
                  <Tabs
                    aria-label="Download options"
                    className="mx-auto"
                    items={tabs}
                  >
                    {(item) => (
                      <Tab key={item.id} title={item.label}>
                        <Card>
                          <CardBody className="py-8 text-center">
                            {/* Conditional rendering for Android Tab */}
                            {item.id === "android" && (
                              <div>
                                <p className="text-lg font-medium pb-5">
                                  Scan the QR code to download the app
                                </p>
                                <img
                                  src={item.content}
                                  className="size-40 mx-auto"
                                  alt="Android App QR Code"
                                />
                                <p className="pt-4">{item.caption}</p>
                              </div>
                            )}

                            {/* Conditional rendering for Windows Tab */}
                            {item.id === "windows" && (
                              <div>
                                <p className="text-lg font-medium pb-4">
                                  {item.caption}
                                </p>
                                <p className="text-sm px-4 mb-5">
                                  For the PC application to work correctly, the
                                  ViGEmBus driver is required. Please{" "}
                                  <Link
                                    href={vigembusDriverUrl}
                                    isExternal
                                    className="text-primary underline"
                                  >
                                    download and install it
                                  </Link>{" "}
                                  if you haven't already.
                                </p>
                                <Button
                                  as="a"
                                  href={item.downloadUrl}
                                  download
                                  className="bg-ink text-white mx-auto"
                                  variant="solid"
                                  radius="xs"
                                >
                                  Download MobControl PC
                                </Button>
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      </Tab>
                    )}
                  </Tabs>
                </div>
              </ModalBody>
              <ModalFooter />
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ActionModalTriggerComponent;