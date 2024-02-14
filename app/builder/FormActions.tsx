import {
  useSelectNodeIndex,
  useWorkflow,
  useActiveSubmitButton,
} from "@i-vresse/wb-core/dist/store";
import { Button } from "~/components/ui/button";

/**
 * Panel for actions to be performed on the currently active form.
 * A form can be for the global parameters or for the parameters of a selected node.
 *
 * The global store must be used to render a certain state.
 *
 * The submit action needs a reference to the hidden submit button in the form like so
 *
 * ```js
 * // In form component
 * import { useSetActiveSubmitButton, useWorkflow } from '@i-vresse/wb-core/dist/store'
 * ...
 * const submitFormRefSetter = useSetActiveSubmitButton()
 * return (
 *   <Form
 *        onSubmit={({ formData }) => console.log(formData)}
 *      >
 *        <button ref={submitFormRefSetter} style={{ display: 'none' }} />
 *  </Form>
 * )
 * ```
 * The FormActions component will use `submitFormRefSetter` to submit form.
 *
 * For example to render the actions when global parameter editing is selected do
 *
 * ```js
 * import { useWorkflow } from '@i-vresse/wb-core/dist/store'
 *
 * const { toggleGlobalEdit } = useWorkflow()
 * toggleGlobalEdit()
 * ```
 */
export const FormActions = (): JSX.Element => {
  const index = useSelectNodeIndex();
  const { deleteNode, clearNodeSelection } = useWorkflow();
  const submitFormRef = useActiveSubmitButton();
  const { editingGlobal, toggleGlobalEdit } = useWorkflow();
  if (submitFormRef === undefined || !(index > -1 || editingGlobal)) {
    return <></>;
  }
  const DeleteButton = (
    <Button
      variant="secondary"
      onClick={() => deleteNode(index)}
      title="Delete node from workflow"
    >
      Delete
    </Button>
  );
  return (
    <div className="justify-end">
      <Button
        type="submit"
        title={
          editingGlobal ? "Save global parameters" : "Save parameters to node"
        }
        onClick={() => submitFormRef.click()}
      >
        Save
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          editingGlobal ? toggleGlobalEdit() : clearNodeSelection()
        }
        title="Forget changes made in form and close form"
      >
        Cancel
      </Button>
      {!editingGlobal && DeleteButton}
    </div>
  );
};
