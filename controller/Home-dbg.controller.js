sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, Fragment, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("com.app.Application.controller.Home", {
		onInit: function () {
			this.onGet();
		},

		onGet: function () {
			var oDataModel = this.getOwnerComponent().getModel("apiModel");
			var url = oDataModel.sServiceUrl;

			var oModel = new sap.ui.model.json.JSONModel();
			var that = this;

			$.ajax({
				type: "GET",
				url: url + "/api/getAll",
				dataType: "json",
				async: false,
				success: function (req, res, temp) {
					that.getOwnerComponent().getModel("tableModel").setData(req);
				},
				error: function (oError) {
					MessageBox.show(oError)
				}
			});
		},

		onCreate: function () {
			var oView = this.getView();
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "com.app.Application.fragments.Form",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pDialog.then(function (oDialog) {
				oDialog.open();
			}.bind(this));
		},

		onClose: function () {
			this._pDialog.then(function (oDialog) {
				oDialog.close();
			}.bind(this));
		},

		onCreateEmployee: function () {
			var that = this;
			var oDataModel = this.getOwnerComponent().getModel("apiModel");
			var url = oDataModel.sServiceUrl;
			var oForm = this.getView().byId("idForm");
			$.ajax({
				type: "POST",
				url: url + "/api/post",
				dataType: "json",
				data: JSON.stringify({
					"pernr": parseInt(oForm.getContent()[1].getValue()),
					"firstName": oForm.getContent()[3].getValue(),
					"lastName": oForm.getContent()[5].getValue(),
					"dateOfBirth": oForm.getContent()[7].getValue(),
					"age": parseInt(oForm.getContent()[9].getValue()),
					"gender": oForm.getContent()[11].getSelectedKey()
				}),
				async: false,
				success: function (req, res, temp) {
					that.onClose();
					that.onGet();
				},
				error: function (oError) {
					MessageBox.show(oError.responseJSON.message);
				},
				contentType: "application/json"
			});
		},

		onDelete: function () {
			debugger;
			var that = this;
			var oTable = this.getView().byId("idTable");
			var oIndex = oTable.getSelectedIndex();
			var oID = this.getOwnerComponent().getModel("tableModel").getData()[oIndex]._id;

			var oDataModel = this.getOwnerComponent().getModel("apiModel");
			var url = oDataModel.sServiceUrl;

			$.ajax({
				type: "DELETE",
				url: url + "/api/delete/" + oID,
				async: false,
				success: function (req, res, temp) {
					that.onGet();
				},
				error: function (oError) {
					MessageBox.show(oError.responseJSON.message);
				},
				contentType: "application/json"
			});
		},

		onEdit: function (oEvent) {
			var oExportEvent = oEvent.getSource();
			this.getView().setModel(oExportEvent, "oImportEvent");

			var oView = this.getView();
			if (!this._pEditDialog) {
				this._pEditDialog = Fragment.load({
					id: oView.getId(),
					name: "com.app.Application.fragments.EditForm",
					controller: this
				}).then(function (oEditDialog) {
					oView.addDependent(oEditDialog);
					return oEditDialog;
				});
			}
			this._pEditDialog.then(function (oEditDialog) {
				this.configUpdateForm();
				oEditDialog.open();
			}.bind(this));
		},

		onCloseEdit: function () {
			this._pEditDialog.then(function (oEditDialog) {
				oEditDialog.close();
			}.bind(this));
		},

		configUpdateForm: function(){
			var oPath = this.getView().getModel("oImportEvent").getParent().getBindingContext("tableModel").getPath().slice(1);
			var oModel = this.getView().getModel("oImportEvent").getParent().getBindingContext("tableModel").getModel().getData()[oPath];
			var oForm = this.getView().byId("idFormEdit");
			oForm._aElements[1].setValue(oModel.pernr);
			oForm._aElements[3].setValue(oModel.firstName);
			oForm._aElements[5].setValue(oModel.lastName);
			oForm._aElements[7].setValue(oModel.dateOfBirth);
			oForm._aElements[9].setValue(oModel.age);
			if(oModel.gender === "male"){
				oForm._aElements[11].setSelectedKey("male")
			} else if(oModel.gender === "female"){
				oForm._aElements[11].setSelectedKey("female")
			} else if(oModel.gender === "other"){
				oForm._aElements[11].setSelectedKey("other")
			}
		},

		onUpdateEmployee: function(){
			debugger;
			var that = this;
			var oDataModel = this.getOwnerComponent().getModel("apiModel");
			var url = oDataModel.sServiceUrl;
			var oForm = this.getView().byId("idFormEdit");
			var oPath = this.getView().getModel("oImportEvent").getParent().getBindingContext("tableModel").getPath().slice(1);
			var oID = this.getView().getModel("oImportEvent").getParent().getBindingContext("tableModel").getModel().getData()[oPath]._id;
			$.ajax({
				type: "PATCH",
   				contentType: 'application/json',
				url: url + "/api/update/" + oID,
				dataType: "json",
				data: JSON.stringify({
					"firstName": oForm._aElements[3].getValue(),
					"lastName": oForm._aElements[5].getValue(),
					"dateOfBirth": oForm._aElements[7].getValue(),
					"age": parseInt(oForm._aElements[9].getValue()),
					"gender": oForm._aElements[11].getSelectedKey()
				}),
				async: false,
				success: function (req, res, temp) {
					debugger;
					that.onCloseEdit();
					that.onGet();
				},
				error: function (oError) {
					debugger;
					MessageBox.show(oError.responseJSON.message);
				},
			});
		}
	});
});