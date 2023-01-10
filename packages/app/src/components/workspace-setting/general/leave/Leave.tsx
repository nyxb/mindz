import Modal from '@/ui/modal';
import {
  StyledModalHeader,
  StyledTextContent,
  StyledModalWrapper,
  StyledButtonContent,
} from './style';
import { ModalCloseButton } from '@/ui/modal';
import { Button } from '@/ui/button';
// import { getDataCenter } from '@affine/datacenter';
// import { useAppState } from '@/providers/app-state-provider';

interface WorkspaceDeleteProps {
  open: boolean;
  onClose: () => void;
  workspaceName: string;
  workspaceId: string;
}

export const WorkspaceLeave = ({
  open,
  onClose,
  workspaceId,
}: WorkspaceDeleteProps) => {
  console.log('workspaceId: ', workspaceId);
  // const router = useRouter();
  // const { refreshWorkspacesMeta } = useAppState();
  const handleLeave = async () => {
    // const dc = await getDataCenter();
    // await dc.apis.leaveWorkspace({ id: workspaceId });
    // // router.push(`/workspace/${nextWorkSpaceId}`);
    // refreshWorkspacesMeta();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <StyledModalWrapper>
        <ModalCloseButton onClick={onClose} />
        <StyledModalHeader>Leave Workspace</StyledModalHeader>
        <StyledTextContent>
          After you leave, you will not be able to access all the contents of
          this workspace.
        </StyledTextContent>
        <StyledButtonContent>
          <Button shape="circle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleLeave}
            type="danger"
            shape="circle"
            style={{ marginLeft: '24px' }}
          >
            Leave
          </Button>
        </StyledButtonContent>
      </StyledModalWrapper>
    </Modal>
  );
};

export default WorkspaceLeave;
