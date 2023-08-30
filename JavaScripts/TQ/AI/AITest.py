#反向传播算法示例
#假设我们有一个具有3个节点的输入层，2个节点的隐藏层和1个节点的输出层的神经网络

import numpy as np

#定义一个sigmoid函数用于激活神经元
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

#定义神经网络中每层的节点数：
input_nodes = 3
hidden_nodes = 2
output_nodes = 1

#定义权重和偏差：
weights_input_to_hidden = np.random.normal(0.0, input_nodes**-0.5, (input_nodes, hidden_nodes))
weights_hidden_to_output = np.random.normal(0.0, hidden_nodes**-0.5, (hidden_nodes, output_nodes))
hidden_bias = np.zeros((1, hidden_nodes))
output_bias = np.zeros((1, output_nodes))
    
#前向传播计算：
def forward_pass(inputs):
    hidden_inputs = np.dot(inputs, weights_input_to_hidden) + hidden_bias
    hidden_outputs = sigmoid(hidden_inputs)
    final_inputs = np.dot(hidden_outputs, weights_hidden_to_output) + output_bias
    final_outputs = sigmoid(final_inputs)
    return final_outputs, hidden_outputs

#反向传播计算梯度：
def backward_pass(inputs, targets, final_outputs, hidden_outputs, lr):
    error = targets - final_outputs
    output_error_term = error * final_outputs * (1 - final_outputs) 
    hidden_error = np.dot(output_error_term, weights_hidden_to_output.T)
    hidden_error_term = hidden_error * hidden_outputs * (1 - hidden_outputs)
    weights_hidden_to_output += lr * np.dot(hidden_outputs.T, output_error_term)
    weights_input_to_hidden += lr * np.dot(inputs.T, hidden_error_term)
    output_bias += lr * output_error_term
    hidden_bias += lr * hidden_error_term

#使用上述函数进行反向传播训练过程：
def training(inputs, targets, epochs, lr):
    for i in range(epochs):
        for x, y in zip(inputs, targets):
            final_outputs, hidden_outputs = forward_pass(x)
            backward_pass(x, y, final_outputs, hidden_outputs, lr)

#训练神经网络：
inputs = np.array([[1, 2, 3]])
targets = np.array([[1]])
training(inputs, targets, epochs=5000, lr=0.1)

'''
在上面的示例中，我们使用numpy实现了sigmoid函数、前向传播、反向传播和神经网络训练过程。
我们首先定义了神经网络的参数，包括输入层节点数、隐藏层节点数、输出层节点数、权重和偏差。
在前向传播函数中，我们按顺序计算每一层的输出值，然后在反向传播函数中计算每个权重和偏差的偏导数并进行更新。
最后我们使用训练函数进行训练，其中传递给训练函数的参数包括输入数据、输出数据、训练轮数和学习率。

需要注意的是，上述示例是一个简单的二分类神经网络模型，并且只使用了单个输入数据进行训练。实际使用时需要根据具体场景进行参数的调整和扩展。
'''