import React from "react";
import { TrashCan } from "@carbon/icons-react/next";
import { Button, Column, Row } from "carbon-components-react";
import { Question, Section } from "../../../../api/types";
import EditQuestion from "../../modals/edit-question";
import styles from "./elements.scss";

interface QuestionElementProps {
  question: Question;
  section: Section;
  index: any;
  deleteQuestion: (index: number) => void;
}

const QuestionElement: React.FC<QuestionElementProps> = ({
  question,
  section,
  index,
  deleteQuestion,
}) => {
  return (
    <div className={styles.questionWrap}>
      <Row>
        <Column>
          <div className={styles.questionLabel}>{question.label}</div>
        </Column>
        <Column>
          <EditQuestion question={question} section={section} index={index} />
          <Button
            size="sm"
            renderIcon={TrashCan}
            iconDescription="Delete Question"
            hasIconOnly
            kind="ghost"
            onClick={() => {
              deleteQuestion(index);
            }}
          />
        </Column>
      </Row>
    </div>
  );
};
export default QuestionElement;
