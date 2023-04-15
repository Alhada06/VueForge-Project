<script setup lang="ts" >
import { toRefs, computed,ref } from "vue";
import type { Task, Board } from "@/types";
import { useAlerts } from "@/stores/alerts";
import { useQuery, useMutation } from "@vue/apollo-composable";
import getBoardQuery from "@/graphql/queries/board.query.gql";
import boardsQuery from "@/graphql/queries/boards.query.gql";
import deleteBoardMutation from "@/graphql/mutations/deleteBoard.mutation.gql";
import updateBoardMutation from "@/graphql/mutations/updateBoard.mutation.gql";
import addTaskToBoardMutation from "@/graphql/mutations/addTaskToBoard.mutation.gql";
import { useRouter } from "vue-router";


const alerts = useAlerts();
const router = useRouter();
const props = defineProps<{
  id: string;
}>();
const { id: boardId } = toRefs(props);
const {
  result: boardData,
  loading: loadingBoard,
  onError: onBoardError,
  refetch
} = useQuery(
  getBoardQuery,
  { id: boardId.value },
  {
    fetchPolicy: "cache-and-network",
  
  }
);
onBoardError(() => alerts.error("Error loading board"));
const board = computed(() => boardData.value?.board || null);
const tasks = computed(() => boardData.value?.board?.tasks?.items);

const boardDragNDrop=ref(null);

const { mutate: updateBoard, onDone: onBoardUpdated } =
  useMutation(updateBoardMutation);
onBoardUpdated(() => alerts.success("Board successfully updated!"));
const updateBoardTitle = (title: string) => {
  if (board.value.title === title) return;
 updateBoard({ id: boardId.value, title });
};

//handle delete board
const { mutate: deleteBoard, onError: onErrorDeletingBoard } = useMutation(
  deleteBoardMutation,
  {
    update(cache) {
           cache.updateQuery({ query: boardsQuery }, (res) => ({
        boardsList: {
          items: res.boardsList.items.filter(
            (b: Board) => b.id !== boardId.value
          ),
        },
      }));
    },
  }
);
onErrorDeletingBoard(() => alerts.error("Error deleting board"));
async function deleteBoardIfConfirmed() {
  const yes = confirm("Are you sure you want to delete this board?");
  if (yes) {
    await deleteBoard({ id: boardId.value });
    router.push("/");
    alerts.success(`Board successfully deleted`);
  }
}

// handle create task
const {
  mutate: addTaskToBoard,
  onError: onErrorCreatingTask,
  onDone: onDoneCreatingTask,
} = useMutation(addTaskToBoardMutation);
// eslint-disable-next-line
let taskResolve = (task: Task) => {};
// eslint-disable-next-line
let taskReject = (message: Error) => {};


async function addTask(task: Task) {
  return new Promise((resolve, reject) => {
    taskResolve = resolve;
    taskReject = reject;
    addTaskToBoard({
      boardId: boardId.value,
      ...task,
    });
 
  });
}

onErrorCreatingTask((error) => {
  taskReject(error);
  alerts.error("Error creating task");
});
onDoneCreatingTask((res) => {
  console.log(res)
  taskResolve(res.data.boardUpdate.tasks.items[0]);
  alerts.success("New task created!");
});




  
// const updatedTask=()=>{
 
//  refetch(); 
  
//   console.log('updated emited')
//   console.log(boardData);
//   console.log(board)
//   console.log(tasks)

// }

</script>

<template>
<div v-if="board">
    <div class="flex justify-between">
      <AppPageHeading>
         <input
          @keydown.enter="($event.target as HTMLInputElement).blur()"
          @blur="updateBoardTitle(($event.target as HTMLInputElement).value)"
          type="text"
          :value="board.title"
        />
      </AppPageHeading>
      <BoardMenu :board="board" @deleteBoard="deleteBoardIfConfirmed" />
    </div>

    
  <BoardDragAndDrop
  ref="boardDragNDrop"
      :tasks="tasks"
      :board="board"
      @update="updateBoard"
      :addTask="addTask"
    />
    <RouterView  />
  </div>
  <AppLoader v-if="loadingBoard" :overlay="true" />
</template>

<style scoped>
pre {
  width: 400px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>