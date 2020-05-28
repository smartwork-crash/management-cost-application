import { Component, ChangeDetectorRef, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  managementForm: FormGroup;
  memberTypesOption: Object[] = [
    { id: 1, name: 'Developer' },
    { id: 2, name: 'Tester' }
  ];
  developerCost: number = 1000;
  testerCost: number = 500;
  managerCost: number = 300;

  constructor(
    private buildForm: FormBuilder,
    public dialog: MatDialog,
    private ref: ChangeDetectorRef) {
    this.managementForm = this.buildForm.group({
      group: this.buildForm.array([
        this.addGroup()
      ])
    })
  }

  ngOnInit() {
    console.log(this.managementForm);

  }

  addGroup(): FormGroup {
    return this.buildForm.group({
      groupName: new FormControl('', Validators.required),
      manager: this.buildForm.array([
        this.addManager()
      ])
    })
  }

  addManager(): FormGroup {
    return this.buildForm.group({
      managerName: new FormControl('', Validators.required),
      member: this.buildForm.array([
        this.addMember()
      ])
    })
  }

  addMember(): FormGroup {
    return this.buildForm.group({
      memberName: new FormControl('', Validators.required),
      memberType: new FormControl('', Validators.required),
    })
  }

  addForm(formControl: string, groupIndex?: number, managerIndex?: number) {
    if (formControl == 'group')
      (<FormArray>this.managementForm.get(formControl)).push(this.addGroup());
    if (formControl == 'manager')
      (<FormArray>this.managementForm.get('group')['controls'][groupIndex].get(formControl)).push(this.addManager());
    if (formControl == 'member')
      (<FormArray>this.managementForm.get('group')['controls'][groupIndex].get('manager')['controls'][managerIndex].get(formControl)).push(this.addMember());
  }

  removeForm(formControl: string, groupIndex?: number, managerIndex?: number, memberIndex?: number) {
    console.log(groupIndex);

    if (formControl == 'group' && groupIndex != 0)
      (<FormArray>this.managementForm.get(formControl)).removeAt(groupIndex);
    else if (formControl == 'manager' && managerIndex != 0)
      (<FormArray>this.managementForm.get('group')['controls'][groupIndex].get(formControl)).removeAt(managerIndex);
    else if (formControl == 'member' && memberIndex != 0)
      (<FormArray>this.managementForm.get('group')['controls'][groupIndex].get('manager')['controls'][managerIndex].get(formControl)).removeAt(memberIndex);
    else {
      alert('You Must have One Entity');
    }
  }

  getManagementDetail(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    let managerConsumption = [];
    let developerConsumption = [];
    let testerConsumption = [];
    let groupConsumption = [];
    if (this.managementForm.valid) {
      this.managementForm.value.group.forEach((group, index) => {
        managerConsumption.push(group.manager.length * this.managerCost);
        group.manager.forEach((manager, managerIndex) => {
          for (const member of manager.member) {
            if (member['memberType'] == "Developer") {

              developerConsumption[index] = (developerConsumption[index] || 0) + this.developerCost;
            }
            if (member['memberType'] == "Tester") {
              testerConsumption[index] = (testerConsumption[index] || 0) + this.testerCost;
            }
          }
          if (managerIndex == (group.manager.length - 1)) groupConsumption.push((managerConsumption[index] || 0) + (developerConsumption[index] || 0) + (testerConsumption[index] || 0));
        })

      });
      this.previewPopup(groupConsumption);
    }
    else
      alert('Fill all Red Coloured Highlighted Fields')
  }

  previewPopup(totalCost: Array<number>) {
    const dialogRef = this.dialog.open(PreviewComponent, {
      width: '1000px', maxHeight: '800px', disableClose: true,
      data: { costEstimation: totalCost, treeData: this.managementForm.value.group }
    });
  }

  ngOnDestroy() {
    this.ref.detach();
  }

}

interface managementTree {
  groupName?: string;
  managerName?: string;
  memberName?: string;
  memberType?: string;
  manager?: managementTree[];
  member?: managementTree[];
}

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./app.component.css']
})
export class PreviewComponent implements OnInit {


  treeControl = new NestedTreeControl<managementTree>(node => node.manager || node.member);
  dataSource = new MatTreeNestedDataSource<managementTree>();
  constructor(
    private dialogRef: MatDialogRef<PreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.treeData;
  }

  hasChild = (_: number, node: managementTree) => !!(node.manager && node.manager.length > 0) || (node.member && node.member.length > 0);

}
