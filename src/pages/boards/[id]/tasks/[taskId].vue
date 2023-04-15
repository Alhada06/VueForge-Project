<script lang="ts" setup>
import {
  Dialog as KDialog,
  DialogActionsBar as KDialogActionsBar,
} from "@progress/kendo-vue-dialogs";
import { Input as KInput } from "@progress/kendo-vue-inputs";
import { Calendar as KCalendar } from "@progress/kendo-vue-dateinputs";
import { Button as KButton } from "@progress/kendo-vue-buttons";
import { Editor as KEditor } from '@progress/kendo-editor-vue-wrapper';
import getTaskQuery from "@/graphql/queries/task.query.gql";
import updateTaskMutation from "@/graphql/mutations/updateTask.mutation.gql"
import { useRoute, useRouter } from "vue-router";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useAlerts } from "@/stores/alerts";
import getBoardQuery from "@/graphql/queries/board.query.gql";

import { ref } from "vue";
import { parseDate } from "@progress/kendo-intl";
const router = useRouter();
const route = useRoute();
const alerts = useAlerts();

const emit = defineEmits<{
  (e: "updatedTask"): void;
  
}>();

const htmlText= `<p>
                The Kendo UI Editor allows your users to edit HTML in a familiar, user-friendly way.<br />
                In this version, the Editor provides the core HTML editing engine, which includes basic text formatting, hyperlinks, lists,
                and image handling. The widget <strong>outputs identical HTML</strong> across all major browsers, follows
                accessibility standards, and provides API for content manipulation.
            </p>
            <p>Features include:</p>
            <ul>
                    <li>Text formatting & alignment</li>
                    <li>Bulleted and numbered lists</li>
                    <li>Hyperlink and image dialogs</li>
                    <li>Cross-browser support</li>
                    <li>Identical HTML output across browsers</li>
                    <li>Gracefully degrades to a <code>textarea</code> when JavaScript is turned off</li>
            </ul>`;
const {
  loading,
  result: taskResult,
  onResult: onTaskLoaded,
} = useQuery(
  getTaskQuery,
  {
    id: route.params.taskId,
  },
  {
    fetchPolicy: "cache-and-network",
  }
);
const task = ref<null | {
  id: string;
  title: string;
  description: string | null;
  dueAt: null | Date;
}>(null);
onTaskLoaded((result) => {
  const data = result.data?.task;
  if (!data) {
    task.value = null;
    return;
  }
  task.value = {
    id: data.id,
    title: data.title,
    description: data.description,
    dueAt: data.dueAt ? parseDate(data.dueAt, "yyyy-MM-dd") : null,
  };
});
function onCloseClicked() {
  router.push(`/boards/${route.params.id}`);
}


const { mutate: updateTask, onDone: onTaskUpdated , onError:onTaskError} =
  useMutation(updateTaskMutation  
  );
onTaskUpdated((res) => {
  alerts.success("Task successfully updated!");
  emit( "updatedTask");
   router.push(`/boards/${route.params.id}`);
  });
onTaskError((res)=>{
  console.log(res);
 alerts.error("Task update failed!");
   router.push(`/boards/${route.params.id}`);

})

// const updateBoardTitle = (title: string) => {
//   if (board.value.title === title) return;
//  updateBoard({ id: boardId.value, title });
// };
 async function update(){
  //  console.log(task.value?.dueAt?.toISOString());

 await updateTask({id:task.value?.id,title:task.value?.title,
  description:task.value?.description,
  dueAt:task.value?.dueAt?.toISOString().substring(0,task.value?.dueAt?.toISOString().indexOf('T'))})

}
</script>


<template>
  <KDialog v-if="task" :title="taskResult?.task?.title" @close="onCloseClicked">
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2 space-y-3">
        <div class="flex flex-col">
          <p class="text-gray-600 text-sm font-medium">Title</p>
          <KInput v-model="task.title" />
        </div>
        <div class="flex flex-col">
          <p class="text-gray-600 text-sm font-medium">Description</p>
          <KInput v-model="task.description" />
            <KEditor :resizable-content="true"
            :resizable-toolbar="true"
            :value="htmlText"
            style="height:280px"
            rows="10"
            cols="30">
    </KEditor>
        </div>
      </div>
      <KCalendar v-model="task.dueAt" />
    </div>
    <KDialogActionsBar>
      <KButton @click="onCloseClicked">Close</KButton>
      <KButton :theme-color="'primary'" @click="update">Save</KButton>
    </KDialogActionsBar>
  </KDialog>
</template>
