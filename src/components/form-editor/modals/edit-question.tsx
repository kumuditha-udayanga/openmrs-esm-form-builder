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
import { Concept, Question, Section } from "../../../api/types";
import { Edit, TrashCan } from "@carbon/icons-react/next";
import { SchemaContext } from "../../../context/context";
import { showToast, useConfig } from "@openmrs/esm-framework";
import { useSearchConcept } from "../../../api/concept";
import styles from "./modals.scss";

interface EditQuestionModalProps {
  question: Question;
  section: Section;
  index: number;
}

const EditQuestion: React.FC<EditQuestionModalProps> = ({
  question,
  section,
  index,
}) => {
  const { t } = useTranslation();
  const [searchConcept, setSearchConcept] = useState("");
  const { concepts } = useSearchConcept(searchConcept);
  const { schema, setSchema } = useContext(SchemaContext);
  const { questionTypes } = useConfig();
  const { renderElements } = useConfig();
  const [openEditQuestionModal, setOpenEditQuestionModal] = useState(false);
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
  const [conceptMappings, setConceptMappings] = useState<any>("");
  const [orderType, setOrderType] = useState("");
  const [orderSettingUuid, setOrderSettingUuid] = useState("");
  const [selectableOrders, setSelectableOrders] = useState<any>("");

  const [isConcept, setIsConcept] = useState<Boolean>(false);
  const [isAnswers, setIsAnswers] = useState<Boolean>(false);
  const [isConceptMapping, setIsConceptMapping] = useState<Boolean>(false);
  const [isOrderType, setIsOrderType] = useState<Boolean>(false);
  const [isOrderSettingUuid, setIsOrderSettingUuid] = useState<Boolean>(false);
  const [isSelectableOrders, setIsSelectableOrders] = useState<Boolean>(false);

  useEffect(() => {
    setQuestionLabel(question.label);
    setQuestionType(question.type);
    setQuestionId(question.id);
    setRenderElement(question.questionOptions.rendering);
    if (question.questionOptions.concept) {
      setIsConcept(true);
      setConcept(question.questionOptions.concept);
    }
    if (question.questionOptions.conceptMappings) {
      setIsConceptMapping(true);
      setConceptMappings(
        JSON.stringify(question.questionOptions.conceptMappings, null, 2)
      );
    }
    if (question.questionOptions.orderType) {
      setIsOrderType(true);
      setOrderType(question.questionOptions.orderType);
    } else {
      setOrderType("placeholder-item");
    }
    if (question.questionOptions.orderSettingUuid) {
      setIsOrderSettingUuid(true);
      setOrderSettingUuid(question.questionOptions.orderSettingUuid);
    }
    if (question.questionOptions.answers) {
      setIsAnswers(true);
      setAnswers(JSON.stringify(question.questionOptions.answers, null, 2));
    }
    if (question.questionOptions.selectableOrders) {
      setIsSelectableOrders(true);
      setSelectableOrders(
        JSON.stringify(question.questionOptions.selectableOrders, null, 2)
      );
    }
    switch (question.questionOptions.rendering) {
      case "number":
        setMax(question.questionOptions.max);
        setMin(question.questionOptions.min);
        break;
      case "date":
        if (question.questionOptions.weekList) {
          setWeekList(
            JSON.stringify(question.questionOptions.weekList, null, 2)
          );
        }
        break;
      case "textarea":
        setRows(question.questionOptions.rows);
        break;
    }
  }, [openEditQuestionModal, question]);

  const removeConcept = () => {
    setConcept("");
    setAnswers("");
    setConceptMappings("");
  };

  const onConceptChange = useCallback((concept: Concept) => {
    setIsAnswers(true);
    setAnswers(
      JSON.stringify(
        concept.answers.map((answer) => {
          return { label: answer.display, concept: answer.uuid };
        }),
        null,
        2
      )
    );
    setConcept(concept.uuid);
    setIsConceptMapping(true);
    setConceptMappings(
      JSON.stringify(
        concept.mappings.map((map) => {
          let data = map.display.split(": ");
          return { type: data[0], value: data[1] };
        }),
        null,
        2
      )
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
      if (isConceptMapping) {
        let parsedConceptMapping = JSON.parse(conceptMappings);
        newQuestion.questionOptions["conceptMappings"] = parsedConceptMapping;
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
      if (questionType == "obsGroup") {
        newQuestion["questions"] = [];
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
      section.questions[index] = newQuestion;
      setSchema({ ...schema });
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("updateQuestion", "Question Updated"),
      });
      setOpenEditQuestionModal(false);
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
          open={openEditQuestionModal}
          onClose={() => setOpenEditQuestionModal(false)}
        >
          <ModalHeader title={t("editQuestion", "Edit Question")} />
          <Form onSubmit={handleSubmit}>
            <ModalBody
              hasScrollingContent
              aria-label="edit-question"
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
                  concept === "" ? (
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
                  ) : (
                    <Row className={styles.conceptRow}>
                      <TextInput
                        id="defaultConcept"
                        labelText="Concept"
                        defaultValue={concept}
                        readOnly
                      />
                      <Button
                        className={styles.removeConceptButton}
                        renderIcon={TrashCan}
                        iconDescription="Remove Concept"
                        size="small"
                        hasIconOnly
                        kind="ghost"
                        onClick={() => {
                          removeConcept();
                        }}
                      />
                    </Row>
                  )
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
                {isConceptMapping ? (
                  <Row>
                    <Column md={6}>
                      <div>
                        <span className={styles.editorTitle}>
                          Concept Mapping
                        </span>
                        <AceEditor
                          mode="json"
                          theme="github"
                          name="conceptMapping"
                          onChange={(value) => {
                            setConceptMappings(value);
                          }}
                          fontSize={10}
                          height="200px"
                          showPrintMargin={true}
                          showGutter={true}
                          highlightActiveLine={true}
                          value={conceptMappings}
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
                          setIsConceptMapping(false);
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
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type={"submit"} kind={"primary"}>
                {t("save", "Save")}
              </Button>
              <Button
                kind={"secondary"}
                onClick={() => setOpenEditQuestionModal(false)}
              >
                {t("close", "Close")}
              </Button>
            </ModalFooter>
          </Form>
        </ComposedModal>
      </div>
      <Button
        size="sm"
        renderIcon={Edit}
        iconDescription="Edit Question"
        hasIconOnly
        kind="ghost"
        onClick={() => {
          setOpenEditQuestionModal(true);
        }}
      />
    </>
  );
};

export default EditQuestion;
