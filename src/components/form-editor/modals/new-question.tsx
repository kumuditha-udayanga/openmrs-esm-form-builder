import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import {
  Button,
  Column,
  ComboBox,
  ComposedModal,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Select,
  SelectItem,
  TextInput,
} from "carbon-components-react";
import { Concept, ConceptMapping } from "../../../api/types";
import { Add, TrashCan } from "@carbon/icons-react/next";
import { SchemaContext } from "../../../context/context";
import { showToast, useConfig } from "@openmrs/esm-framework";
import { useSearchConcept } from "../../../api/concept";
import styles from "./modals.scss";

interface CreateQuestionModalProps {
  questions: any;
}

const CreateQuestion: React.FC<CreateQuestionModalProps> = ({ questions }) => {
  const { t } = useTranslation();
  const [searchConcept, setSearchConcept] = useState("");
  const { concepts } = useSearchConcept(searchConcept);
  const { schema, setSchema } = useContext(SchemaContext);
  const { questionTypes } = useConfig();
  const { renderElements } = useConfig();
  const [openCreateQuestionModal, setOpenCreateQuestionModal] = useState(false);
  const [questionLabel, setQuestionLabel] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionId, setQuestionId] = useState("");
  // Question Options
  const [renderElement, setRenderElement] = useState("");
  const [answers, setAnswers] = useState<any>("");
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [weekList, setWeekList] = useState<any>("");
  const [rows, setRows] = useState("");
  // Optional properties
  const [concept, setConcept] = useState<string>(null);
  const [conceptMappings, setConceptMappings] = useState<ConceptMapping[]>([]);
  const [orderSettingUuid, setOrderSettingUuid] = useState("");
  const [orderType, setOrderType] = useState("");
  const [selectableOrders, setSelectableOrders] = useState<any>("");

  const [isConcept, setIsConcept] = useState<Boolean>(false);
  const [isOrderType, setIsOrderType] = useState<Boolean>(false);
  const [isOrderSettingUuid, setIsOrderSettingUuid] = useState<Boolean>(false);
  const [isSelectableOrders, setIsSelectableOrders] = useState<Boolean>(false);
  const [isAnswers, setIsAnswers] = useState<Boolean>(false);

  useEffect(() => {
    setQuestionLabel("");
    setQuestionType("placeholder-item");
    setRenderElement("placeholder-item");
    setQuestionId("");
    setAnswers("");
    setMax("");
    setMin("");
    setWeekList("");
    setOrderSettingUuid("");
    setOrderType("placeholder-item");
    setSelectableOrders("");
    setIsConcept(false);
    setIsOrderType(false);
    setIsOrderSettingUuid(false);
    setIsSelectableOrders(false);
    setIsAnswers(false);
  }, [openCreateQuestionModal]);

  const onConceptChange = useCallback((selectedConcept: Concept) => {
    setIsAnswers(true);
    setAnswers(
      JSON.stringify(
        selectedConcept.answers.map((answer) => {
          return { label: answer.display, concept: answer.uuid };
        }),
        null,
        2
      )
    );
    setConcept(selectedConcept.uuid);
    setConceptMappings(
      selectedConcept.mappings.map((map) => {
        let data = map.display.split(": ");
        return { type: data[0], value: data[1] };
      })
    );
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    let newQuestion = {
      label: questionLabel,
      type: questionType,
      id: questionId,
      questionOptions: {},
    };
    try {
      newQuestion.questionOptions["rendering"] = renderElement;
      if (isConcept) {
        newQuestion.questionOptions["concept"] = concept;
      }
      if (isAnswers) {
        let parsedAnswers = JSON.parse(answers);
        newQuestion.questionOptions["answers"] = parsedAnswers;
      }
      if (isOrderType) {
        newQuestion.questionOptions["orderType"] = orderType;
      }
      if (isOrderSettingUuid) {
        newQuestion.questionOptions["orderSettingUuid"] = orderSettingUuid;
      }
      if (isSelectableOrders) {
        let parsedSelectableOrders = JSON.parse(selectableOrders);
        newQuestion.questionOptions["selectableOrders"] =
          parsedSelectableOrders;
      }
      switch (renderElement) {
        case "number":
          newQuestion.questionOptions["max"] = max;
          newQuestion.questionOptions["min"] = min;
          break;
        case "date":
          let parsedWeekList = JSON.parse(weekList);
          newQuestion.questionOptions["weekList"] = parsedWeekList;
          break;
        case "textarea":
          newQuestion.questionOptions["rows"] = rows;
          break;
      }
      questions.push(newQuestion);
      setSchema({ ...schema });
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("createQuestionSuccess", "Question Created"),
      });
      setOpenCreateQuestionModal(false);
    } catch (error) {
      showToast({
        title: t("error", "Error"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };
  return (
    <>
      <div>
        <ComposedModal
          open={openCreateQuestionModal}
          onClose={() => setOpenCreateQuestionModal(false)}
        >
          <ModalHeader title={t("createQuestion", "Create Question")} />
          <Form onSubmit={handleSubmit}>
            <ModalBody
              hasScrollingContent
              aria-label="new-question"
              className={styles.modalContent}
            >
              <Select
                value="default"
                id="type"
                onChange={() => {}}
                labelText="Add new property"
                disabled={false}
                inline={true}
                invalid={false}
              >
                <SelectItem
                  text="Select property"
                  value="default"
                  disabled
                  hidden
                />
                <SelectItem
                  text="Concept"
                  value="concept"
                  onClick={() => {
                    if (isConcept) {
                      showToast({
                        title: t("warning", "Warning"),
                        kind: "warning",
                        critical: true,
                        description: "Property Already in use",
                      });
                    } else {
                      setIsConcept(true);
                    }
                  }}
                />
                <SelectItem
                  text="Order Type"
                  value="orderType"
                  onClick={() => {
                    if (isOrderType) {
                      showToast({
                        title: t("warining", "Warning"),
                        kind: "warning",
                        critical: true,
                        description: "Property Already in use",
                      });
                    } else {
                      setIsOrderType(true);
                    }
                  }}
                />
                <SelectItem
                  text="Order Setting Uuid"
                  value="orderSettingUuid"
                  onClick={() => {
                    if (isOrderSettingUuid) {
                      showToast({
                        title: t("warining", "Warning"),
                        kind: "warning",
                        critical: true,
                        description: "Property Already in use",
                      });
                    } else {
                      setIsOrderSettingUuid(true);
                    }
                  }}
                />
                <SelectItem
                  text="Selectable Orders"
                  value="selectableOrders"
                  onClick={() => {
                    if (isSelectableOrders) {
                      showToast({
                        title: t("warining", "Warning"),
                        kind: "warning",
                        critical: true,
                        description: "Property Already in use",
                      });
                    } else {
                      setIsSelectableOrders(true);
                    }
                  }}
                />
                <SelectItem
                  text="Answers"
                  value="answers"
                  onClick={() => {
                    if (isAnswers) {
                      showToast({
                        title: t("warining", "Warning"),
                        kind: "warning",
                        critical: true,
                        description: "Property Already in use",
                      });
                    } else {
                      setIsAnswers(true);
                    }
                  }}
                />
              </Select>
              <FormGroup legendText={""}>
                <TextInput
                  id="questionLabel"
                  labelText="Label"
                  value={questionLabel}
                  onChange={(event) => setQuestionLabel(event.target.value)}
                  required
                />
                <Select
                  value={questionType}
                  onChange={(event) => {
                    setQuestionType(event.target.value);
                    if (event.target.value == "obs") {
                      setIsConcept(true);
                    }
                  }}
                  id="type"
                  invalidText="A valid value is required"
                  labelText="Type"
                  disabled={false}
                  inline={false}
                  invalid={false}
                  required
                >
                  <SelectItem
                    text="Choose an option"
                    value="placeholder-item"
                    disabled
                    hidden
                  />
                  {questionTypes.map((type, key) => (
                    <SelectItem text={type} value={type} key={key} />
                  ))}
                </Select>
                <Select
                  value={renderElement}
                  onChange={(event) => setRenderElement(event.target.value)}
                  id="rendering"
                  invalidText="A valid value is required"
                  labelText="Rendering"
                  disabled={false}
                  inline={false}
                  invalid={false}
                  required
                >
                  <SelectItem
                    text="Choose an option"
                    value="placeholder-item"
                    disabled
                    hidden
                  />
                  {renderElements.map((element, key) => (
                    <SelectItem text={element} value={element} key={key} />
                  ))}
                </Select>
                {renderElement === "number" ? (
                  <>
                    <TextInput
                      id="min"
                      labelText="Min"
                      value={min || ""}
                      onChange={(event) => setMin(event.target.value)}
                      required
                    />
                    <TextInput
                      id="max"
                      labelText="Max"
                      value={max || ""}
                      onChange={(event) => setMax(event.target.value)}
                      required
                    />
                  </>
                ) : renderElement === "textarea" ? (
                  <TextInput
                    id="rows"
                    labelText="Rows"
                    value={rows || ""}
                    onChange={(event) => setRows(event.target.value)}
                    required
                  />
                ) : null}
                <TextInput
                  id="questionId"
                  labelText="ID"
                  value={questionId}
                  onChange={(event) => setQuestionId(event.target.value)}
                  required
                />
                {renderElement === "date" ? (
                  <Row>
                    <Column md={6}>
                      <div>
                        <span className={styles.editorTitle}>Week List</span>
                        <AceEditor
                          mode="json"
                          theme="github"
                          name="weekList"
                          onChange={(value) => setWeekList(value)}
                          fontSize={10}
                          height="200px"
                          showPrintMargin={true}
                          showGutter={true}
                          highlightActiveLine={true}
                          value={weekList}
                          setOptions={{
                            enableBasicAutocompletion: false,
                            enableLiveAutocompletion: false,
                            displayIndentGuides: false,
                            enableSnippets: false,
                            showLineNumbers: true,
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </Column>
                  </Row>
                ) : null}
                {isConcept ? (
                  <Row>
                    <Column md={7}>
                      <ComboBox
                        onChange={(event) => {
                          event.selectedItem != null
                            ? onConceptChange(event.selectedItem)
                            : null;
                        }}
                        id="concepts"
                        onInputChange={(event) => {
                          setSearchConcept(event);
                        }}
                        items={concepts}
                        itemToString={(concept) =>
                          concept ? concept?.display : ""
                        }
                        placeholder="Search Concept"
                        titleText="Concept"
                        className={styles.comboBox}
                        required
                      />
                    </Column>
                    <Column md={1}>
                      <Button
                        className={styles.propertyOption}
                        size="sm"
                        renderIcon={TrashCan}
                        iconDescription="Delete Element"
                        hasIconOnly
                        kind="ghost"
                        onClick={() => {
                          setIsConcept(false);
                        }}
                      />
                    </Column>
                  </Row>
                ) : null}
                {isOrderType ? (
                  <Row>
                    <Column md={7}>
                      <Select
                        value={orderType}
                        onChange={(event) => setOrderType(event.target.value)}
                        id="orderType"
                        invalidText="A valid value is required"
                        labelText="Order Type"
                        disabled={false}
                        inline={false}
                        invalid={false}
                        required
                      >
                        <SelectItem
                          text="Choose an option"
                          value="placeholder-item"
                          disabled
                          hidden
                        />
                        <SelectItem text="Drug Order" value="drugorder" />
                        <SelectItem text="Test Order" value="testorder" />
                      </Select>
                    </Column>
                    <Column md={1}>
                      <Button
                        size="sm"
                        className={styles.propertyOption}
                        renderIcon={TrashCan}
                        iconDescription="Delete Element"
                        hasIconOnly
                        kind="ghost"
                        onClick={() => {
                          setIsOrderType(false);
                        }}
                      />
                    </Column>
                  </Row>
                ) : null}
                {isOrderSettingUuid ? (
                  <Row>
                    <Column md={7}>
                      <TextInput
                        id="orderSettingUuid"
                        labelText="Order Setting Uuid"
                        value={orderSettingUuid}
                        onChange={(event) =>
                          setOrderSettingUuid(event.target.value)
                        }
                        required
                      />
                    </Column>
                    <Column md={1}>
                      <Button
                        size="sm"
                        className={styles.propertyOption}
                        renderIcon={TrashCan}
                        iconDescription="Delete Element"
                        hasIconOnly
                        kind="ghost"
                        onClick={() => {
                          setIsOrderSettingUuid(false);
                        }}
                      />
                    </Column>
                  </Row>
                ) : null}
                {isSelectableOrders ? (
                  <Row>
                    <Column md={6}>
                      <div>
                        <span className={styles.editorTitle}>
                          Selectable Orders
                        </span>
                        <AceEditor
                          mode="json"
                          theme="github"
                          name="selectableOrders"
                          onChange={(value) => setSelectableOrders(value)}
                          fontSize={10}
                          height="200px"
                          showPrintMargin={true}
                          showGutter={true}
                          highlightActiveLine={true}
                          value={selectableOrders}
                          setOptions={{
                            enableBasicAutocompletion: false,
                            enableLiveAutocompletion: false,
                            displayIndentGuides: false,
                            enableSnippets: false,
                            showLineNumbers: true,
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </Column>
                    <Column md={1}>
                      <Button
                        size="sm"
                        className={styles.editorOption}
                        renderIcon={TrashCan}
                        iconDescription="Delete Element"
                        hasIconOnly
                        kind="ghost"
                        onClick={() => {
                          setIsSelectableOrders(false);
                        }}
                      />
                    </Column>
                  </Row>
                ) : null}
                {isAnswers ? (
                  <Row>
                    <Column md={6}>
                      <div>
                        <span className={styles.editorTitle}>Answers</span>
                        <AceEditor
                          mode="json"
                          theme="github"
                          name="answers"
                          onChange={(value) => {
                            setAnswers(value);
                          }}
                          fontSize={10}
                          height="200px"
                          showPrintMargin={true}
                          showGutter={true}
                          highlightActiveLine={true}
                          value={answers}
                          setOptions={{
                            enableBasicAutocompletion: false,
                            enableLiveAutocompletion: false,
                            displayIndentGuides: false,
                            enableSnippets: false,
                            showLineNumbers: true,
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </Column>
                    <Column md={1}>
                      <Button
                        size="sm"
                        className={styles.editorOption}
                        renderIcon={TrashCan}
                        iconDescription="Delete Element"
                        hasIconOnly
                        kind="ghost"
                        onClick={() => {
                          setIsAnswers(false);
                        }}
                      />
                    </Column>
                  </Row>
                ) : null}
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type={"submit"} kind={"primary"}>
                {t("save", "Save")}
              </Button>
              <Button
                kind={"secondary"}
                onClick={() => setOpenCreateQuestionModal(false)}
              >
                {t("close", "Close")}
              </Button>
            </ModalFooter>
          </Form>
        </ComposedModal>
      </div>
      <Button
        renderIcon={Add}
        kind="tertiary"
        size="small"
        hasIconOnly
        iconDescription="New Question"
        onClick={() => {
          setOpenCreateQuestionModal(true);
        }}
      />
    </>
  );
};

export default CreateQuestion;
